const mongoose = require('mongoose');
const { PAYMENT_PURPOSE, PAYMENT_STATUS } = require('../constants/enums');

const paymentSchema = new mongoose.Schema(
  {
    paymentCode: { type: String, required: true, unique: true },
    purpose: {
      type: String,
      enum: Object.values(PAYMENT_PURPOSE),
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'VND' },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    provider: { type: String, default: 'sandbox' },
    payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', default: null },
    sandboxToken: { type: String, required: true },
    providerRef: { type: String, default: null },
    paidAt: { type: Date, default: null },
    failureReason: { type: String, default: '' },
    rawCallback: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

paymentSchema.index({ payer: 1, createdAt: -1 });
paymentSchema.index({ status: 1, purpose: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
