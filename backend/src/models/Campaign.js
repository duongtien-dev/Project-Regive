const mongoose = require('mongoose');
const { CAMPAIGN_STATUS } = require('../constants/enums');

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    goal: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(CAMPAIGN_STATUS),
      default: CAMPAIGN_STATUS.DRAFT,
    },
    targetAmount: { type: Number, default: 0, min: 0 },
    raisedAmount: { type: Number, default: 0, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

campaignSchema.index({ status: 1, startDate: -1 });

module.exports = mongoose.model('Campaign', campaignSchema);
