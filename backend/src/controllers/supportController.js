const { body, param } = require('express-validator');
const SupportRequest = require('../models/SupportRequest');
const Campaign = require('../models/Campaign');
const { SUPPORT_STATUS, ROLES } = require('../constants/enums');
const { ApiError, success, asyncHandler } = require('../utils/api');
const { createNotification } = require('../services/common');

const createValidators = [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('urgency').optional().isIn(['low', 'medium', 'high']),
  body('campaignId').optional().isMongoId(),
];

const reviewValidators = [
  param('id').isMongoId(),
  body('status').isIn(Object.values(SUPPORT_STATUS)),
  body('reviewNote').optional().isString(),
];

const create = asyncHandler(async (req, res) => {
  if (req.user.role !== ROLES.BENEFICIARY && req.user.role !== ROLES.ADMIN) {
    throw new ApiError(403, 'Chỉ tài khoản BENEFICIARY mới có thể tạo yêu cầu hỗ trợ');
  }

  if (req.body.campaignId) {
    const campaign = await Campaign.findById(req.body.campaignId);
    if (!campaign) {
      throw new ApiError(400, 'campaignId không hợp lệ');
    }
  }

  const supportRequest = await SupportRequest.create({
    beneficiary: req.user._id,
    campaign: req.body.campaignId || null,
    title: req.body.title,
    description: req.body.description,
    urgency: req.body.urgency || 'medium',
  });

  await createNotification({
    userId: req.user._id,
    title: 'Đã gửi yêu cầu hỗ trợ',
    message: 'Yêu cầu hỗ trợ của bạn đang chờ xét duyệt.',
    type: 'support',
    relatedId: supportRequest._id.toString(),
  });

  return success(res, { supportRequest }, 'Tạo yêu cầu hỗ trợ thành công', 201);
});

const myRequests = asyncHandler(async (req, res) => {
  const supportRequests = await SupportRequest.find({ beneficiary: req.user._id })
    .populate('campaign', 'title status')
    .sort({ createdAt: -1 });
  return success(res, { supportRequests });
});

const listAll = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const supportRequests = await SupportRequest.find(filter)
    .populate('beneficiary', 'fullName email phone address beneficiaryInfo')
    .populate('campaign', 'title status')
    .populate('handledBy', 'fullName email')
    .sort({ createdAt: -1 });
  return success(res, { supportRequests });
});

const getById = asyncHandler(async (req, res) => {
  const supportRequest = await SupportRequest.findById(req.params.id)
    .populate('beneficiary', 'fullName email phone address beneficiaryInfo')
    .populate('campaign', 'title status')
    .populate('handledBy', 'fullName email');

  if (!supportRequest) {
    throw new ApiError(404, 'Không tìm thấy yêu cầu hỗ trợ');
  }

  const isOwner = supportRequest.beneficiary._id.toString() === req.user._id.toString();
  const isStaff = [ROLES.ADMIN, ROLES.EMPLOYEE].includes(req.user.role);
  if (!isOwner && !isStaff) {
    throw new ApiError(403, 'Bạn không có quyền truy cập');
  }

  return success(res, { supportRequest });
});

const review = asyncHandler(async (req, res) => {
  const supportRequest = await SupportRequest.findById(req.params.id);
  if (!supportRequest) {
    throw new ApiError(404, 'Không tìm thấy yêu cầu hỗ trợ');
  }

  supportRequest.status = req.body.status;
  if (req.body.reviewNote !== undefined) {
    supportRequest.reviewNote = req.body.reviewNote;
  }
  supportRequest.handledBy = req.user._id;
  supportRequest.handledAt = new Date();
  await supportRequest.save();

  await createNotification({
    userId: supportRequest.beneficiary,
    title: 'Cập nhật yêu cầu hỗ trợ',
    message: `Trạng thái yêu cầu hỗ trợ của bạn hiện là ${supportRequest.status}.`,
    type: 'support',
    relatedId: supportRequest._id.toString(),
  });

  return success(res, { supportRequest }, 'Duyệt yêu cầu hỗ trợ thành công');
});

const confirmReceived = asyncHandler(async (req, res) => {
  const supportRequest = await SupportRequest.findById(req.params.id);
  if (!supportRequest) {
    throw new ApiError(404, 'Không tìm thấy yêu cầu hỗ trợ');
  }

  if (supportRequest.beneficiary.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Bạn không có quyền truy cập');
  }

  if (
    ![SUPPORT_STATUS.APPROVED, SUPPORT_STATUS.IN_PROGRESS, SUPPORT_STATUS.COMPLETED].includes(
      supportRequest.status
    )
  ) {
    throw new ApiError(400, 'Yêu cầu hỗ trợ chưa sẵn sàng để xác nhận đã nhận');
  }

  supportRequest.receivedConfirmed = true;
  supportRequest.receivedAt = new Date();
  if (supportRequest.status !== SUPPORT_STATUS.COMPLETED) {
    supportRequest.status = SUPPORT_STATUS.COMPLETED;
  }
  await supportRequest.save();

  return success(res, { supportRequest }, 'Xác nhận đã nhận hỗ trợ thành công');
});

module.exports = {
  createValidators,
  reviewValidators,
  create,
  myRequests,
  listAll,
  getById,
  review,
  confirmReceived,
};
