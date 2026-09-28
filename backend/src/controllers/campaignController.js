const { body, param } = require('express-validator');
const Campaign = require('../models/Campaign');
const { CAMPAIGN_STATUS } = require('../constants/enums');
const { ApiError, success, asyncHandler } = require('../utils/api');

const campaignBodyValidators = [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('goal').trim().notEmpty(),
  body('location').trim().notEmpty(),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('status').optional().isIn(Object.values(CAMPAIGN_STATUS)),
  body('targetAmount').optional().isFloat({ min: 0 }),
];

const campaignUpdateValidators = [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('goal').optional().trim().notEmpty(),
  body('location').optional().trim().notEmpty(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('status').optional().isIn(Object.values(CAMPAIGN_STATUS)),
  body('targetAmount').optional().isFloat({ min: 0 }),
];

const idParam = [param('id').isMongoId()];

const listPublic = asyncHandler(async (req, res) => {
  const filter = { status: CAMPAIGN_STATUS.ACTIVE };
  if (req.query.status && req.user && ['ADMIN', 'EMPLOYEE'].includes(req.user.role)) {
    filter.status = req.query.status;
  }
  const campaigns = await Campaign.find(filter).sort({ startDate: -1 });
  return success(res, { campaigns });
});

const listAll = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const campaigns = await Campaign.find(filter)
    .populate('createdBy', 'fullName email role')
    .sort({ createdAt: -1 });
  return success(res, { campaigns });
});

const getById = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id).populate(
    'createdBy',
    'fullName email role'
  );
  if (!campaign) {
    throw new ApiError(404, 'Campaign not found');
  }

  const isStaff = req.user && ['ADMIN', 'EMPLOYEE'].includes(req.user.role);
  if (campaign.status !== CAMPAIGN_STATUS.ACTIVE && !isStaff) {
    throw new ApiError(404, 'Campaign not found');
  }

  return success(res, { campaign });
});

const create = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    goal,
    location,
    startDate,
    endDate,
    status,
    targetAmount,
  } = req.body;

  if (new Date(endDate) < new Date(startDate)) {
    throw new ApiError(400, 'endDate must be after startDate');
  }

  const campaign = await Campaign.create({
    title,
    description,
    goal,
    location,
    startDate,
    endDate,
    status: status || CAMPAIGN_STATUS.DRAFT,
    targetAmount: targetAmount || 0,
    createdBy: req.user._id,
  });

  return success(res, { campaign }, 'Campaign created', 201);
});

const update = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  if (!campaign) {
    throw new ApiError(404, 'Campaign not found');
  }

  const fields = [
    'title',
    'description',
    'goal',
    'location',
    'startDate',
    'endDate',
    'status',
    'targetAmount',
  ];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) {
      campaign[field] = req.body[field];
    }
  });

  if (new Date(campaign.endDate) < new Date(campaign.startDate)) {
    throw new ApiError(400, 'endDate must be after startDate');
  }

  await campaign.save();
  return success(res, { campaign }, 'Campaign updated');
});

const remove = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findByIdAndDelete(req.params.id);
  if (!campaign) {
    throw new ApiError(404, 'Campaign not found');
  }
  return success(res, null, 'Campaign deleted');
});

module.exports = {
  campaignBodyValidators,
  campaignUpdateValidators,
  idParam,
  listPublic,
  listAll,
  getById,
  create,
  update,
  remove,
};
