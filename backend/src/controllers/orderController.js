const { body, param } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const {
  ROLES,
  ORDER_STATUS,
  PRODUCT_STATUS,
} = require('../constants/enums');
const { ApiError, success, asyncHandler } = require('../utils/api');
const { shortCode } = require('../utils/codes');
const { createNotification } = require('../services/common');
const { canListProduct } = require('../services/productRules');

const createValidators = [
  body('productId').isMongoId(),
  body('quantity').optional().isInt({ min: 1 }),
  body('shippingAddress').optional().isString(),
  body('phone').optional().isString(),
  body('note').optional().isString(),
];

const statusValidators = [
  param('id').isMongoId(),
  body('status').isIn([
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.COMPLETED,
    ORDER_STATUS.CANCELLED,
  ]),
  body('note').optional().isString(),
];

const create = asyncHandler(async (req, res) => {
  if (req.user.role !== ROLES.USER && req.user.role !== ROLES.ADMIN) {
    throw new ApiError(403, 'Only USER can place orders');
  }

  const quantity = req.body.quantity || 1;
  const product = await Product.findById(req.body.productId);
  if (!product || !product.listedOnMarketplace || product.status !== PRODUCT_STATUS.LISTED) {
    throw new ApiError(400, 'Product is not available on marketplace');
  }

  const listCheck = canListProduct(product);
  if (!listCheck.ok) {
    throw new ApiError(400, listCheck.reason);
  }

  if (product.stockQuantity < quantity) {
    throw new ApiError(400, 'Insufficient stock');
  }

  const order = await Order.create({
    orderCode: shortCode('ORD'),
    buyer: req.user._id,
    items: [
      {
        product: product._id,
        name: product.name,
        price: product.price,
        quantity,
      },
    ],
    totalAmount: product.price * quantity,
    currency: product.currency || 'VND',
    status: ORDER_STATUS.PENDING,
    shippingAddress: req.body.shippingAddress || req.user.address || '',
    phone: req.body.phone || req.user.phone || '',
    note: req.body.note || '',
    statusHistory: [
      {
        status: ORDER_STATUS.PENDING,
        at: new Date(),
        by: req.user._id,
        note: 'Order created',
      },
    ],
  });

  await createNotification({
    userId: req.user._id,
    title: 'Đơn hàng đã tạo',
    message: `Đơn ${order.orderCode} đang chờ thanh toán.`,
    type: 'order',
    relatedId: order._id.toString(),
  });

  return success(res, { order }, 'Order created', 201);
});

const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ buyer: req.user._id })
    .populate('items.product', 'name images price status')
    .populate('payment', 'paymentCode status amount paidAt')
    .sort({ createdAt: -1 });
  return success(res, { orders });
});

const listAll = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const orders = await Order.find(filter)
    .populate('buyer', 'fullName email phone')
    .populate('items.product', 'name stockQuantity status')
    .populate('payment', 'paymentCode status amount paidAt')
    .populate('processedBy', 'fullName email')
    .sort({ createdAt: -1 });

  return success(res, { orders });
});

const getById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('buyer', 'fullName email phone address')
    .populate('items.product', 'name images price status stockQuantity')
    .populate('payment', 'paymentCode status amount paidAt provider')
    .populate('processedBy', 'fullName email');

  if (!order) throw new ApiError(404, 'Order not found');

  const isOwner = order.buyer._id.toString() === req.user._id.toString();
  const isStaff = [ROLES.ADMIN, ROLES.EMPLOYEE].includes(req.user.role);
  if (!isOwner && !isStaff) throw new ApiError(403, 'Forbidden');

  return success(res, { order });
});

const updateStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  const next = req.body.status;
  const current = order.status;

  const allowed = {
    [ORDER_STATUS.PAID]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.COMPLETED],
    [ORDER_STATUS.PENDING]: [ORDER_STATUS.CANCELLED],
  };

  if (!allowed[current] || !allowed[current].includes(next)) {
    throw new ApiError(400, `Cannot change order from ${current} to ${next}`);
  }

  order.status = next;
  order.processedBy = req.user._id;
  order.statusHistory.push({
    status: next,
    at: new Date(),
    by: req.user._id,
    note: req.body.note || '',
  });
  await order.save();

  await createNotification({
    userId: order.buyer,
    title: 'Cập nhật đơn hàng',
    message: `Đơn ${order.orderCode} chuyển sang trạng thái ${next}.`,
    type: 'order',
    relatedId: order._id.toString(),
  });

  return success(res, { order }, 'Order status updated');
});

module.exports = {
  createValidators,
  statusValidators,
  create,
  myOrders,
  listAll,
  getById,
  updateStatus,
};
