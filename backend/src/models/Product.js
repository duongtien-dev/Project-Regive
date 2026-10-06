const mongoose = require('mongoose');
const {
  PRODUCT_STATUS,
  PRODUCT_CONDITION,
  PRODUCT_QUALITY,
} = require('../constants/enums');

const specificationSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const inspectionReportSchema = new mongoose.Schema(
  {
    conditionDetails: { type: String, default: '', trim: true },
    functionalityStatus: { type: String, default: 'Đã kiểm tra hoạt động tốt 100%', trim: true },
    sanitizationStatus: { type: String, default: 'Đã khử khuẩn & làm sạch chuyên sâu', trim: true },
    accessoriesIncluded: [{ type: String, trim: true }],
    inspectedAt: { type: Date, default: null },
    inspectorName: { type: String, default: 'Chuyên viên kiểm định ReGive', trim: true },
    score: { type: Number, default: 9.5, min: 0, max: 10 },
  },
  { _id: false }
);

const donationStorySchema = new mongoose.Schema(
  {
    donorName: { type: String, default: '', trim: true },
    donorType: { type: String, default: 'individual', trim: true },
    isAnonymous: { type: Boolean, default: false },
    donorMessage: { type: String, default: '', trim: true },
    intakeLocation: { type: String, default: '', trim: true },
    receivedAt: { type: Date, default: null },
  },
  { _id: false }
);

const charityImpactSchema = new mongoose.Schema(
  {
    directBenefit: { type: String, default: '', trim: true },
    co2SavedKg: { type: Number, default: 0, min: 0 },
    wasteDivertedKg: { type: Number, default: 0, min: 0 },
    fundAllocationPercent: { type: Number, default: 100, min: 0, max: 100 },
  },
  { _id: false }
);

const warehouseAndShippingSchema = new mongoose.Schema(
  {
    storageLocation: { type: String, default: '', trim: true },
    packagingType: { type: String, default: 'Túi/Hộp giấy kraft tái chế bảo vệ môi trường', trim: true },
    shippingOptions: [{ type: String, trim: true }],
    estimatedDeliveryDays: { type: String, default: '2 - 3 ngày làm việc', trim: true },
  },
  { _id: false }
);

const guaranteePolicySchema = new mongoose.Schema(
  {
    warrantyDays: { type: Number, default: 30, min: 0 },
    returnPolicy: { type: String, default: 'Đồng kiểm khi nhận hàng. Đổi trả hoặc hoàn tiền 100% nếu sai mô tả kiểm định.', trim: true },
    supportHotline: { type: String, default: '1900 6868 (8:00 - 20:00)', trim: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    sku: { type: String, default: '', trim: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, default: '', trim: true },
    origin: { type: String, default: 'Việt Nam', trim: true },
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
    originalPrice: { type: Number, default: 0, min: 0 },
    suggestedPrice: { type: Number, default: 0, min: 0 },
    price: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'VND' },
    weight: { type: String, default: '', trim: true },
    dimensions: {
      length: { type: Number, default: 0 },
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
      unit: { type: String, default: 'cm' },
    },
    material: { type: String, default: '', trim: true },
    color: { type: String, default: '', trim: true },
    tags: [{ type: String, trim: true }],
    highlights: [{ type: String, trim: true }],
    specifications: [specificationSchema],
    inspectionReport: { type: inspectionReportSchema, default: () => ({}) },
    donationStory: { type: donationStorySchema, default: () => ({}) },
    charityImpact: { type: charityImpactSchema, default: () => ({}) },
    warehouseAndShipping: { type: warehouseAndShippingSchema, default: () => ({}) },
    guaranteePolicy: { type: guaranteePolicySchema, default: () => ({}) },
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
productSchema.index({ sku: 1 });

module.exports = mongoose.model('Product', productSchema);
