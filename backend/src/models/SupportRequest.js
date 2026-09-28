const mongoose = require('mongoose');
const { SUPPORT_STATUS } = require('../constants/enums');

const supportRequestSchema = new mongoose.Schema(
  {
    beneficiary: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    urgency: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: Object.values(SUPPORT_STATUS),
      default: SUPPORT_STATUS.PENDING,
    },
    reviewNote: { type: String, default: '' },
    receivedConfirmed: { type: Boolean, default: false },
    receivedAt: { type: Date, default: null },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    handledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

supportRequestSchema.index({ beneficiary: 1, createdAt: -1 });
supportRequestSchema.index({ status: 1 });

module.exports = mongoose.model('SupportRequest', supportRequestSchema);
