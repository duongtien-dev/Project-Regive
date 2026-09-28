const mongoose = require('mongoose');
const {
  PRODUCT_STATUS,
  PRODUCT_CONDITION,
  PRODUCT_QUALITY,
} = require('../constants/enums');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    category: { type: String, default: 'other', trim: true },
    images: [{ type: String }],
    donation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Donation',
      default: null,
    },
    campaign: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      default: null,
    },
    condition: {
      type: String,
      enum: Object.values(PRODUCT_CONDITION),
      default: null,
    },
    quality: {
      type: String,
      enum: Object.values(PRODUCT_QUALITY),
      default: null,
    },
    suggestedPrice: { type: Number, default: 0, min: 0 },
    price: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'VND' },
    suitableForMarketplace: { type: Boolean, default: false },
    reviewed: { type: Boolean, default: false },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
    listedOnMarketplace: { type: Boolean, default: false },
    listedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.DRAFT,
    },
    stockQuantity: { type: Number, default: 0, min: 0 },
    storageLocation: { type: String, default: '', trim: true },
    assessmentNote: { type: String, default: '' },
    latestAiAssessment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AiAssessment',
      default: null,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

productSchema.index({ listedOnMarketplace: 1, status: 1, category: 1 });
productSchema.index({ donation: 1 });

module.exports = mongoose.model('Product', productSchema);
