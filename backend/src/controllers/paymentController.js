const { body, param } = require('express-validator');
const Payment = require('../models/Payment');
const { PAYMENT_PURPOSE, ROLES } = require('../constants/enums');
const { ApiError, success, asyncHandler } = require('../utils/api');
const { createPayment, confirmSandboxPayment } = require('../services/paymentService');

function sanitizePayment(payment, { includeSandboxToken = false } = {}) {
  const obj = payment.toObject ? payment.toObject() : { ...payment };
  if (!includeSandboxToken) {
    delete obj.sandboxToken;
  }
  delete obj.rawCallback;
  return obj;
}

const createValidators = [
  body('purpose').isIn(Object.values(PAYMENT_PURPOSE)),
  body('orderId').optional().isMongoId(),
  body('donationId').optional().isMongoId(),
];

const confirmValidators = [
  body('paymentId').isMongoId(),
  body('sandboxToken').isString().notEmpty(),
];

const create = asyncHandler(async (req, res) => {
  const { purpose, orderId, donationId } = req.body;

  if (purpose === PAYMENT_PURPOSE.ORDER && !orderId) {
    throw new ApiError(400, 'orderId is required for order payment');
  }
  if (purpose === PAYMENT_PURPOSE.DONATION && !donationId) {
    throw new ApiError(400, 'donationId is required for donation payment');
  }

  const payment = await createPayment({
    purpose,
    payerId: req.user._id,
    orderId,
    donationId,
  });

  return success(
    res,
    {
      payment: {
        id: payment._id,
        paymentCode: payment.paymentCode,
        purpose: payment.purpose,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        provider: payment.provider,
        sandboxToken: payment.sandboxToken,
        order: payment.order,
        donation: payment.donation,
        checkoutHint:
          'Sandbox mode: call POST /api/payments/sandbox/confirm with paymentId + sandboxToken',
      },
    },
    'Payment created',
    201
  );
});

const sandboxConfirm = asyncHandler(async (req, res) => {
  const payment = await confirmSandboxPayment({
    paymentId: req.body.paymentId,
    sandboxToken: req.body.sandboxToken,
    rawCallback: req.body,
  });

  return success(res, { payment: sanitizePayment(payment) }, 'Sandbox payment confirmed');
});

const sandboxWebhook = asyncHandler(async (req, res) => {
  const paymentId = req.body.paymentId || req.body.payment_id;
  const token = req.body.sandboxToken || req.body.token;
  if (!paymentId || !token) {
    throw new ApiError(400, 'paymentId and sandboxToken are required');
  }

  const payment = await confirmSandboxPayment({
    paymentId,
    sandboxToken: token,
    rawCallback: req.body,
  });

  return success(res, { payment: sanitizePayment(payment) }, 'Webhook processed');
});

const getById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('order', 'orderCode status totalAmount')
    .populate('donation', 'type amount status')
    .populate('payer', 'fullName email');

  if (!payment) throw new ApiError(404, 'Payment not found');

  const isOwner = payment.payer._id.toString() === req.user._id.toString();
  const isStaff = [ROLES.ADMIN, ROLES.EMPLOYEE].includes(req.user.role);
  if (!isOwner && !isStaff) throw new ApiError(403, 'Forbidden');

  return success(res, {
    payment: sanitizePayment(payment, {
      includeSandboxToken: isOwner && payment.status === 'pending',
    }),
  });
});

const myPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ payer: req.user._id })
    .populate('order', 'orderCode status totalAmount')
    .populate('donation', 'type amount status')
    .sort({ createdAt: -1 });
  return success(res, { payments: payments.map((p) => sanitizePayment(p)) });
});

const listAll = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.purpose) filter.purpose = req.query.purpose;

  const payments = await Payment.find(filter)
    .populate('payer', 'fullName email')
    .populate('order', 'orderCode status')
    .populate('donation', 'type amount status')
    .sort({ createdAt: -1 });

  return success(res, { payments: payments.map((p) => sanitizePayment(p)) });
});

module.exports = {
  createValidators,
  confirmValidators,
  create,
  sandboxConfirm,
  sandboxWebhook,
  getById,
  myPayments,
  listAll,
};
