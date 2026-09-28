const Product = require('../models/Product');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Donation = require('../models/Donation');
const InventoryTransaction = require('../models/InventoryTransaction');
const {
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_PURPOSE,
  DONATION_TYPES,
  PRODUCT_STATUS,
} = require('../constants/enums');
const { success, asyncHandler } = require('../utils/api');

const overview = asyncHandler(async (_req, res) => {
  const [
    totalProducts,
    listedProducts,
    lowStock,
    ordersPending,
    ordersPaid,
    paymentsSuccess,
    moneyDonationsCompleted,
  ] = await Promise.all([
    Product.countDocuments(),
    Product.countDocuments({ listedOnMarketplace: true, status: PRODUCT_STATUS.LISTED }),
    Product.countDocuments({ stockQuantity: { $gt: 0, $lte: 2 } }),
    Order.countDocuments({ status: ORDER_STATUS.PENDING }),
    Order.countDocuments({
      status: { $in: [ORDER_STATUS.PAID, ORDER_STATUS.PROCESSING, ORDER_STATUS.SHIPPED, ORDER_STATUS.COMPLETED] },
    }),
    Payment.countDocuments({ status: PAYMENT_STATUS.SUCCESS }),
    Donation.countDocuments({ type: DONATION_TYPES.MONEY, status: 'completed' }),
  ]);

  const [orderRevenue, donationRevenue] = await Promise.all([
    Payment.aggregate([
      {
        $match: {
          status: PAYMENT_STATUS.SUCCESS,
          purpose: PAYMENT_PURPOSE.ORDER,
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Payment.aggregate([
      {
        $match: {
          status: PAYMENT_STATUS.SUCCESS,
          purpose: PAYMENT_PURPOSE.DONATION,
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('buyer', 'fullName email')
    .select('orderCode status totalAmount createdAt');

  const recentPayments = await Payment.find({ status: PAYMENT_STATUS.SUCCESS })
    .sort({ paidAt: -1 })
    .limit(5)
    .populate('payer', 'fullName email')
    .select('paymentCode purpose amount paidAt');

  const recentStockMoves = await InventoryTransaction.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('product', 'name')
    .select('type quantity previousStock newStock reason createdAt');

  return success(res, {
    summary: {
      totalProducts,
      listedProducts,
      lowStock,
      ordersPending,
      ordersPaid,
      paymentsSuccess,
      moneyDonationsCompleted,
      orderRevenue: orderRevenue[0]?.total || 0,
      donationRevenue: donationRevenue[0]?.total || 0,
      currency: 'VND',
    },
    recentOrders,
    recentPayments,
    recentStockMoves,
  });
});

module.exports = { overview };
