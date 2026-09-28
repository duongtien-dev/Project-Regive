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
    throw new ApiError(403, 'Only BENEFICIARY can create support requests');
  }

  if (req.body.campaignId) {
    const campaign = await Campaign.findById(req.body.campaignId);
    if (!campaign) {
      throw new ApiError(400, 'Invalid campaignId');
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
    title: 'Support request submitted',
    message: 'Your support request is pending review.',
    type: 'support',
    relatedId: supportRequest._id.toString(),
  });

  return success(res, { supportRequest }, 'Support request created', 201);
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
    throw new ApiError(404, 'Support request not found');
  }

  const isOwner = supportRequest.beneficiary._id.toString() === req.user._id.toString();
  const isStaff = [ROLES.ADMIN, ROLES.EMPLOYEE].includes(req.user.role);
  if (!isOwner && !isStaff) {
    throw new ApiError(403, 'Forbidden');
  }

  return success(res, { supportRequest });
});

const review = asyncHandler(async (req, res) => {
  const supportRequest = await SupportRequest.findById(req.params.id);
  if (!supportRequest) {
    throw new ApiError(404, 'Support request not found');
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
    title: 'Support request updated',
    message: `Your support request status is now ${supportRequest.status}.`,
    type: 'support',
    relatedId: supportRequest._id.toString(),
  });

  return success(res, { supportRequest }, 'Support request reviewed');
});

const confirmReceived = asyncHandler(async (req, res) => {
  const supportRequest = await SupportRequest.findById(req.params.id);
  if (!supportRequest) {
    throw new ApiError(404, 'Support request not found');
  }

  if (supportRequest.beneficiary.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Forbidden');
  }

  if (
    ![SUPPORT_STATUS.APPROVED, SUPPORT_STATUS.IN_PROGRESS, SUPPORT_STATUS.COMPLETED].includes(
      supportRequest.status
    )
  ) {
    throw new ApiError(400, 'Support request is not ready for receive confirmation');
  }

  supportRequest.receivedConfirmed = true;
  supportRequest.receivedAt = new Date();
  if (supportRequest.status !== SUPPORT_STATUS.COMPLETED) {
    supportRequest.status = SUPPORT_STATUS.COMPLETED;
  }
  await supportRequest.save();

  return success(res, { supportRequest }, 'Support received confirmed');
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
