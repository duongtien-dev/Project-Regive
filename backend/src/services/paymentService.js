const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const Product = require('../models/Product');
const {
  PAYMENT_PURPOSE,
  PAYMENT_STATUS,
  ORDER_STATUS,
  DONATION_STATUS,
  DONATION_TYPES,
  PRODUCT_STATUS,
  INVENTORY_TX_TYPE,
} = require('../constants/enums');
const { ApiError } = require('../utils/api');
const { shortCode, sandboxToken } = require('../utils/codes');
const { applyStockChange } = require('./inventoryService');
const { createNotification } = require('./common');

async function createPayment({ purpose, payerId, orderId, donationId }) {
  if (purpose === PAYMENT_PURPOSE.ORDER) {
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.buyer.toString() !== payerId.toString()) {
      throw new ApiError(403, 'Order does not belong to payer');
    }
    if (order.status !== ORDER_STATUS.PENDING) {
      throw new ApiError(400, 'Order is not payable');
    }

    const existing = await Payment.findOne({
      order: order._id,
      status: PAYMENT_STATUS.PENDING,
    });
    if (existing) return existing;

    return Payment.create({
      paymentCode: shortCode('PAY'),
      purpose,
      amount: order.totalAmount,
      currency: order.currency,
      payer: payerId,
      order: order._id,
      sandboxToken: sandboxToken(),
    });
  }

  if (purpose === PAYMENT_PURPOSE.DONATION) {
    const donation = await Donation.findById(donationId);
    if (!donation) throw new ApiError(404, 'Donation not found');
    if (donation.donor.toString() !== payerId.toString()) {
      throw new ApiError(403, 'Donation does not belong to payer');
    }
    if (donation.type !== DONATION_TYPES.MONEY) {
      throw new ApiError(400, 'Only money donations can be paid online');
    }
    if (![DONATION_STATUS.PENDING, DONATION_STATUS.CONFIRMED].includes(donation.status)) {
      throw new ApiError(400, 'Donation is not payable');
    }

    const existing = await Payment.findOne({
      donation: donation._id,
      status: PAYMENT_STATUS.PENDING,
    });
    if (existing) return existing;

    return Payment.create({
      paymentCode: shortCode('PAY'),
      purpose,
      amount: donation.amount,
      currency: donation.currency || 'VND',
      payer: payerId,
      donation: donation._id,
      sandboxToken: sandboxToken(),
    });
  }

  throw new ApiError(400, 'Invalid payment purpose');
}

async function confirmSandboxPayment({ paymentId, sandboxToken: token, rawCallback = null }) {
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }

  // Idempotent success
  if (payment.status === PAYMENT_STATUS.SUCCESS) {
    return payment;
  }

  if (payment.status !== PAYMENT_STATUS.PENDING) {
    throw new ApiError(400, `Payment cannot be confirmed from status ${payment.status}`);
  }

  if (payment.sandboxToken !== token) {
    throw new ApiError(400, 'Invalid sandbox token');
  }

  // Mark success first to reduce double-confirm race (best-effort without replica-set txn)
  const claimed = await Payment.findOneAndUpdate(
    { _id: payment._id, status: PAYMENT_STATUS.PENDING, sandboxToken: token },
    {
      $set: {
        status: PAYMENT_STATUS.SUCCESS,
        paidAt: new Date(),
        providerRef: shortCode('SBX'),
        rawCallback,
      },
    },
    { new: true }
  );

  if (!claimed) {
    const latest = await Payment.findById(paymentId);
    if (latest && latest.status === PAYMENT_STATUS.SUCCESS) return latest;
    throw new ApiError(409, 'Payment already processed');
  }

  if (claimed.purpose === PAYMENT_PURPOSE.ORDER) {
    const order = await Order.findById(claimed.order);
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.status === ORDER_STATUS.CANCELLED) {
      throw new ApiError(400, 'Order was cancelled');
    }

    if (order.status === ORDER_STATUS.PENDING) {
      for (const item of order.items) {
        await applyStockChange({
          productId: item.product,
          type: INVENTORY_TX_TYPE.OUT,
          quantity: item.quantity,
          userId: claimed.payer,
          reason: `Sold via order ${order.orderCode}`,
          referenceType: 'order',
          referenceId: order._id.toString(),
        });

        const product = await Product.findById(item.product);
        if (product && product.stockQuantity === 0) {
          product.status = PRODUCT_STATUS.SOLD_OUT;
          product.listedOnMarketplace = false;
          await product.save();
        }
      }

      order.status = ORDER_STATUS.PAID;
      order.payment = claimed._id;
      order.statusHistory.push({
        status: ORDER_STATUS.PAID,
        at: new Date(),
        by: claimed.payer,
        note: 'Payment sandbox success',
      });
      await order.save();

      await createNotification({
        userId: order.buyer,
        title: 'Thanh toán đơn hàng thành công',
        message: `Đơn ${order.orderCode} đã được thanh toán.`,
        type: 'payment',
        relatedId: claimed._id.toString(),
      });
    }
  }

  if (claimed.purpose === PAYMENT_PURPOSE.DONATION) {
    const donation = await Donation.findById(claimed.donation);
    if (!donation) throw new ApiError(404, 'Donation not found');

    if (donation.status !== DONATION_STATUS.COMPLETED) {
      donation.status = DONATION_STATUS.COMPLETED;
      donation.processedAt = new Date();
      await donation.save();

      await Campaign.findByIdAndUpdate(donation.campaign, {
        $inc: { raisedAmount: donation.amount },
      });
    }

    await createNotification({
      userId: donation.donor,
      title: 'Thanh toán quyên góp thành công',
      message: `Quyên góp ${donation.amount.toLocaleString('vi-VN')} VND đã được thanh toán.`,
      type: 'payment',
      relatedId: claimed._id.toString(),
    });
  }

  return claimed;
}

module.exports = { createPayment, confirmSandboxPayment };
