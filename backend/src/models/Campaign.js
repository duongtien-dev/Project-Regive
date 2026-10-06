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

const budgetItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    percentage: { type: Number, default: 0, min: 0, max: 100 },
    amount: { type: Number, default: 0, min: 0 },
    description: { type: String, default: '', trim: true },
  },
  { _id: false }
);

const timelineItemSchema = new mongoose.Schema(
  {
    phase: { type: String, default: '', trim: true },
    date: { type: String, default: '', trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['completed', 'in_progress', 'upcoming'],
      default: 'upcoming',
    },
  },
  { _id: false }
);

const faqItemSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
  },
  { _id: false }
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
    urgency: {
      type: String,
      enum: ['normal', 'urgent', 'emergency'],
      default: 'normal',
    },
    targetAmount: { type: Number, default: 0, min: 0 },
    raisedAmount: { type: Number, default: 0, min: 0 },
    beneficiaryCount: { type: Number, default: 0, min: 0 },
    beneficiaryUnit: { type: String, default: 'người thụ hưởng', trim: true },
    impactSummary: { type: String, default: '', trim: true },
    category: { type: String, default: 'chung', trim: true },
    bannerImage: { type: String, default: '' },
    galleryImages: [{ type: String }],
    organization: { type: String, default: 'Ban Điều Hành ReGive', trim: true },
    contactInfo: {
      representative: { type: String, default: '' },
      phone: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    bankAccount: {
      bankName: { type: String, default: 'Ngân hàng Quân Đội (MB Bank)' },
      accountNumber: { type: String, default: '9999REGIVE' },
      accountHolder: { type: String, default: 'QUY THIEN NGUYEN REGIVE VIET NAM' },
      branch: { type: String, default: 'Chi nhánh Hà Nội' },
      qrCodeUrl: { type: String, default: '' },
    },
    volunteerConditions: { type: String, default: '' },
    targetItems: [targetItemSchema],
    budgetBreakdown: [budgetItemSchema],
    timeline: [timelineItemSchema],
    faqs: [faqItemSchema],
    verificationStatus: {
      isVerified: { type: Boolean, default: true },
      verifiedAt: { type: Date, default: Date.now },
      verifiedBy: { type: String, default: 'Hội đồng Thẩm định ReGive & Chính quyền địa phương' },
      licenseNumber: { type: String, default: 'GP-TGQ-2026/UBND' },
    },
    donationGuidelines: {
      moneyNote: {
        type: String,
        default:
          '100% số tiền ủng hộ được nạp vào quỹ chiến dịch, sao kê minh bạch theo thời gian thực và không trừ chi phí quản trị.',
      },
      productNote: {
        type: String,
        default:
          'Hiện vật ủng hộ cần còn dùng tốt (>80%), sạch sẽ, không rách nát hỏng hóc để bảo đảm giá trị trao tặng.',
      },
      receivingAddress: {
        type: String,
        default: 'Kho Tổng ReGive Trung Tâm và các Điểm Trạm tiếp nhận toàn quốc.',
      },
    },
    tags: [{ type: String, trim: true }],
    activities: [campaignActivitySchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

campaignSchema.index({ status: 1, startDate: -1 });
campaignSchema.index({ category: 1, status: 1 });

module.exports = mongoose.model('Campaign', campaignSchema);
