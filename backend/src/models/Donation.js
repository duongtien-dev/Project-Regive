const mongoose = require('mongoose');
const { DONATION_TYPES, DONATION_STATUS } = require('../constants/enums');

const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    type: {
      type: String,
      enum: Object.values(DONATION_TYPES),
      required: true,
    },
    amount: {
      type: Number,
      min: 0,
      default: 0,
    },
    currency: {
      type: String,
      default: 'VND',
    },
    productInfo: {
      name: { type: String, default: '' },
      quantity: { type: Number, default: 1, min: 1 },
      description: { type: String, default: '' },
      conditionNote: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: Object.values(DONATION_STATUS),
      default: DONATION_STATUS.PENDING,
    },
    note: { type: String, default: '' },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    processedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

donationSchema.index({ donor: 1, createdAt: -1 });
donationSchema.index({ campaign: 1, status: 1 });

module.exports = mongoose.model('Donation', donationSchema);
