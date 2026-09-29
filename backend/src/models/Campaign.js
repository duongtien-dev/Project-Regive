const mongoose = require('mongoose');
const { CAMPAIGN_STATUS } = require('../constants/enums');

const campaignActivitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    date: { type: Date, default: Date.now },
    content: { type: String, required: true },
    image: { type: String, default: '' },
    author: { type: String, default: 'Ban điều phối ReGive' },
  },
  { _id: true }
);

const targetItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    targetQty: { type: Number, default: 0, min: 0 },
    receivedQty: { type: Number, default: 0, min: 0 },
    unit: { type: String, default: 'món', trim: true },
  },
  { _id: true }
);

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    shortDescription: { type: String, default: '', trim: true },
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
    category: { type: String, default: 'chung', trim: true },
    bannerImage: { type: String, default: '' },
    organization: { type: String, default: 'Ban Điều Hành ReGive', trim: true },
    contactInfo: {
      representative: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    volunteerConditions: { type: String, default: '' },
    targetItems: [targetItemSchema],
    tags: [{ type: String, trim: true }],
    activities: [campaignActivitySchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

campaignSchema.index({ status: 1, startDate: -1 });

module.exports = mongoose.model('Campaign', campaignSchema);
