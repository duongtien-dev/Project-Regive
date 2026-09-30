const crypto = require('crypto');
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
const config = require('../config');
const { shortCode } = require('../utils/codes');
const { applyStockChange } = require('./inventoryService');
const { createNotification } = require('./common');

function pad2(value) {
  return String(value).padStart(2, '0');
}

function formatVnpayDate(date) {
  return [
    date.getFullYear(),
    pad2(date.getMonth() + 1),
    pad2(date.getDate()),
    pad2(date.getHours()),
    pad2(date.getMinutes()),
    pad2(date.getSeconds()),
  ].join('');
}

function normalizeIp(value = '') {
  return value.split(',')[0].trim().replace('::ffff:', '') || '127.0.0.1';
}

function buildSignedQuery(params) {
  const search = new URLSearchParams();
  Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .sort()
    .forEach((key) => search.append(key, String(params[key])));
  return search.toString();
}

function signVnpayParams(params) {
  const secret = config.vnpay.hashSecret;
  if (!config.vnpay.url || !config.vnpay.merchantId || !secret) {
    throw new ApiError(500, 'VNPay chưa được cấu hình');
  }

  const signData = buildSignedQuery(params);
  const secureHash = crypto.createHmac('sha512', secret).update(signData).digest('hex');
  return { signData, secureHash };
}

function verifyVnpaySignature(query) {
  const receivedHash = query.vnp_SecureHash;
  if (!receivedHash) return false;

  const params = { ...query };
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  const { secureHash } = signVnpayParams(params);
  if (secureHash.length !== String(receivedHash).length) return false;
  return crypto.timingSafeEqual(Buffer.from(secureHash), Buffer.from(String(receivedHash)));
}

async function createPayment({ purpose, payerId, orderId, donationId, clientReturnUrl = null }) {
  if (purpose === PAYMENT_PURPOSE.ORDER) {
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng');
    if (order.buyer.toString() !== payerId.toString()) {
      throw new ApiError(403, 'Đơn hàng không thuộc về người thanh toán');
    }
    if (order.status !== ORDER_STATUS.PENDING) {
      throw new ApiError(400, 'Đơn hàng hiện không thể thanh toán');
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
      provider: 'vnpay',
      payer: payerId,
      order: order._id,
      clientReturnUrl,
    });
  }

  if (purpose === PAYMENT_PURPOSE.DONATION) {
    const donation = await Donation.findById(donationId);
    if (!donation) throw new ApiError(404, 'Không tìm thấy quyên góp');
    if (donation.donor.toString() !== payerId.toString()) {
      throw new ApiError(403, 'Quyên góp không thuộc về người thanh toán');
    }
    if (donation.type !== DONATION_TYPES.MONEY) {
      throw new ApiError(400, 'Chỉ quyên góp bằng tiền mới có thể thanh toán trực tuyến');
    }
    if (![DONATION_STATUS.PENDING, DONATION_STATUS.CONFIRMED].includes(donation.status)) {
      throw new ApiError(400, 'Quyên góp hiện không thể thanh toán');
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
      provider: 'vnpay',
      payer: payerId,
      donation: donation._id,
      clientReturnUrl,
    });
  }

  throw new ApiError(400, 'Mục đích thanh toán không hợp lệ');
}

function createVnpayCheckoutUrl({ payment, returnUrl, ipAddr }) {
  const createdAt = new Date();
  const expireAt = new Date(createdAt.getTime() + 15 * 60 * 1000);
  const params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: config.vnpay.merchantId,
    vnp_Amount: Math.round(payment.amount * 100),
    vnp_CurrCode: payment.currency || 'VND',
    vnp_TxnRef: payment.paymentCode,
    vnp_OrderInfo: `Thanh toan ReGive ${payment.paymentCode}`,
    vnp_OrderType: 'other',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: normalizeIp(ipAddr),
    vnp_CreateDate: formatVnpayDate(createdAt),
    vnp_ExpireDate: formatVnpayDate(expireAt),
  };

  const { signData, secureHash } = signVnpayParams(params);
  return `${config.vnpay.url}?${signData}&vnp_SecureHash=${secureHash}`;
}

async function completePayment({ paymentId, paymentCode, providerRef, rawCallback = null, claimFilter = {} }) {
  const lookup = paymentId ? { _id: paymentId } : { paymentCode };
  const payment = await Payment.findOne(lookup);
  if (!payment) {
    throw new ApiError(404, 'Không tìm thấy thanh toán');
  }

  // Idempotent success
  if (payment.status === PAYMENT_STATUS.SUCCESS) {
    return payment;
  }

  if (payment.status !== PAYMENT_STATUS.PENDING) {
    throw new ApiError(400, `Không thể xác nhận thanh toán từ trạng thái ${payment.status}`);
  }

  // Mark success first to reduce double-confirm race (best-effort without replica-set txn)
  const claimed = await Payment.findOneAndUpdate(
    { _id: payment._id, status: PAYMENT_STATUS.PENDING, ...claimFilter },
    {
      $set: {
        status: PAYMENT_STATUS.SUCCESS,
        paidAt: new Date(),
        providerRef,
        rawCallback,
      },
    },
    { new: true }
  );

  if (!claimed) {
    const latest = await Payment.findById(paymentId);
    if (latest && latest.status === PAYMENT_STATUS.SUCCESS) return latest;
    throw new ApiError(409, 'Thanh toán đã được xử lý');
  }

  if (claimed.purpose === PAYMENT_PURPOSE.ORDER) {
    const order = await Order.findById(claimed.order);
    if (!order) throw new ApiError(404, 'Không tìm thấy đơn hàng');
    if (order.status === ORDER_STATUS.CANCELLED) {
      throw new ApiError(400, 'Đơn hàng đã bị hủy');
    }

    if (order.status === ORDER_STATUS.PENDING) {
      for (const item of order.items) {
        await applyStockChange({
          productId: item.product,
          type: INVENTORY_TX_TYPE.OUT,
          quantity: item.quantity,
          userId: claimed.payer,
          reason: `Bán qua đơn hàng ${order.orderCode}`,
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
        note: 'Thanh toán VNPay thành công',
      });
      await order.save();

      // Allocate revenue to linked charity campaigns (Circular Charity)
      for (const item of order.items) {
        const prod = await Product.findById(item.product);
        if (prod && prod.campaign) {
          const itemTotal = (item.price || 0) * (item.quantity || 1);
          if (itemTotal > 0) {
            await Campaign.findByIdAndUpdate(prod.campaign, {
              $inc: { raisedAmount: itemTotal },
            });
          }
        }
      }

      await createNotification({
        userId: order.buyer,
        title: 'Thanh toán đơn hàng thành công',
        message: `Đơn ${order.orderCode} đã được thanh toán. Doanh thu đã được chuyển vào quỹ thiện nguyện liên kết!`,
        type: 'payment',
        relatedId: claimed._id.toString(),
      });
    }
  }

  if (claimed.purpose === PAYMENT_PURPOSE.DONATION) {
    const donation = await Donation.findById(claimed.donation);
    if (!donation) throw new ApiError(404, 'Không tìm thấy quyên góp');

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

async function confirmSandboxPayment({ paymentId, sandboxToken: token, rawCallback = null }) {
  const payment = await Payment.findById(paymentId);
  if (!payment) throw new ApiError(404, 'Không tìm thấy thanh toán');
  if (payment.sandboxToken !== token) throw new ApiError(400, 'sandboxToken không hợp lệ');

  return completePayment({
    paymentId,
    providerRef: shortCode('SBX'),
    rawCallback,
    claimFilter: { sandboxToken: token },
  });
}

async function confirmVnpayPayment({ query }) {
  if (!verifyVnpaySignature(query)) {
    throw new ApiError(400, 'Chữ ký VNPay không hợp lệ');
  }

  const responseCode = query.vnp_ResponseCode;
  const transactionStatus = query.vnp_TransactionStatus;
  const payment = await Payment.findOne({ paymentCode: query.vnp_TxnRef });
  if (!payment) throw new ApiError(404, 'Không tìm thấy thanh toán');

  if (responseCode !== '00' || transactionStatus !== '00') {
    payment.status = PAYMENT_STATUS.FAILED;
    payment.failureReason = `Phản hồi VNPay ${responseCode || 'không xác định'}`;
    payment.providerRef = query.vnp_TransactionNo || query.vnp_BankTranNo || null;
    payment.rawCallback = query;
    await payment.save();
    return payment;
  }

  const expectedAmount = Math.round(payment.amount * 100);
  if (Number(query.vnp_Amount) !== expectedAmount) {
    throw new ApiError(400, 'Số tiền VNPay không khớp');
  }

  return completePayment({
    paymentId: payment._id,
    providerRef: query.vnp_TransactionNo || query.vnp_BankTranNo || query.vnp_TxnRef,
    rawCallback: query,
  });
}

module.exports = {
  createPayment,
  createVnpayCheckoutUrl,
  confirmSandboxPayment,
  confirmVnpayPayment,
};
