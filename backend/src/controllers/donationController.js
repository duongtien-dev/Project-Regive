const { body, param } = require('express-validator');
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const {
  DONATION_TYPES,
  DONATION_STATUS,
  CAMPAIGN_STATUS,
  ROLES,
} = require('../constants/enums');
const { ApiError, success, asyncHandler } = require('../utils/api');
const { createNotification } = require('../services/common');

const createValidators = [
  body('campaignId').isMongoId(),
  body('type').isIn(Object.values(DONATION_TYPES)),
  body('amount').optional().isFloat({ min: 0 }),
  body('note').optional().isString(),
  body('productInfo.name').optional().isString(),
  body('productInfo.quantity').optional().isInt({ min: 1 }),
  body('productInfo.description').optional().isString(),
  body('productInfo.conditionNote').optional().isString(),
];

const statusValidators = [
  param('id').isMongoId(),
  body('status').isIn(Object.values(DONATION_STATUS)),
];

const create = asyncHandler(async (req, res) => {
  if (![ROLES.USER, ROLES.ADMIN].includes(req.user.role)) {
    throw new ApiError(403, 'Only USER can create donations');
  }

  const { campaignId, type, amount, note, productInfo } = req.body;
  const campaign = await Campaign.findById(campaignId);
  if (!campaign || campaign.status !== CAMPAIGN_STATUS.ACTIVE) {
    throw new ApiError(400, 'Campaign is not available for donation');
  }

  if (type === DONATION_TYPES.MONEY) {
    if (!amount || amount <= 0) {
      throw new ApiError(400, 'amount is required for money donation');
    }
  }

  if (type === DONATION_TYPES.PRODUCT) {
    if (!productInfo || !productInfo.name) {
      throw new ApiError(400, 'productInfo.name is required for product donation');
    }
  }

  const donation = await Donation.create({
    donor: req.user._id,
    campaign: campaignId,
    type,
    amount: type === DONATION_TYPES.MONEY ? amount : 0,
    productInfo:
      type === DONATION_TYPES.PRODUCT
        ? {
            name: productInfo.name,
            quantity: productInfo.quantity || 1,
            description: productInfo.description || '',
            conditionNote: productInfo.conditionNote || '',
          }
        : undefined,
    note: note || '',
    status: DONATION_STATUS.PENDING,
  });

  await createNotification({
    userId: req.user._id,
    title: 'Donation received',
    message: `Donation ${donation._id} is pending confirmation.`,
    type: 'donation',
    relatedId: donation._id.toString(),
  });

  return success(res, { donation }, 'Donation created', 201);
});

const myDonations = asyncHandler(async (req, res) => {
  const donations = await Donation.find({ donor: req.user._id })
    .populate('campaign', 'title status location')
    .sort({ createdAt: -1 });
  return success(res, { donations });
});

const listAll = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.type = req.query.type;
  if (req.query.campaignId) filter.campaign = req.query.campaignId;

  const donations = await Donation.find(filter)
    .populate('donor', 'fullName email phone')
    .populate('campaign', 'title status')
    .populate('processedBy', 'fullName email')
    .sort({ createdAt: -1 });
  return success(res, { donations });
});

const getById = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id)
    .populate('donor', 'fullName email phone')
    .populate('campaign', 'title status')
    .populate('processedBy', 'fullName email');

  if (!donation) {
    throw new ApiError(404, 'Donation not found');
  }

  const isOwner = donation.donor._id.toString() === req.user._id.toString();
  const isStaff = [ROLES.ADMIN, ROLES.EMPLOYEE].includes(req.user.role);
  if (!isOwner && !isStaff) {
    throw new ApiError(403, 'Forbidden');
  }

  return success(res, { donation });
});

const updateStatus = asyncHandler(async (req, res) => {
  const donation = await Donation.findById(req.params.id).populate('campaign');
  if (!donation) {
    throw new ApiError(404, 'Donation not found');
  }

  const prev = donation.status;
  donation.status = req.body.status;
  donation.processedBy = req.user._id;
  donation.processedAt = new Date();
  await donation.save();

  if (
    donation.type === DONATION_TYPES.MONEY &&
    req.body.status === DONATION_STATUS.COMPLETED &&
    prev !== DONATION_STATUS.COMPLETED
  ) {
    await Campaign.findByIdAndUpdate(donation.campaign._id || donation.campaign, {
      $inc: { raisedAmount: donation.amount },
    });
  }

  await createNotification({
    userId: donation.donor,
    title: 'Donation status updated',
    message: `Your donation status changed to ${donation.status}.`,
    type: 'donation',
    relatedId: donation._id.toString(),
  });

  return success(res, { donation }, 'Donation status updated');
});

module.exports = {
  createValidators,
  statusValidators,
  create,
  myDonations,
  listAll,
  getById,
  updateStatus,
};
