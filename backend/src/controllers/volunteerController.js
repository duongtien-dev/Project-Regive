const { body, param } = require('express-validator');
const VolunteerRegistration = require('../models/VolunteerRegistration');
const Campaign = require('../models/Campaign');
const {
  VOLUNTEER_STATUS,
  CAMPAIGN_STATUS,
  ROLES,
} = require('../constants/enums');
const { ApiError, success, asyncHandler } = require('../utils/api');
const { createNotification } = require('../services/common');

const registerValidators = [
  body('campaignId').isMongoId(),
  body('skills').optional().isString(),
  body('availabilityNote').optional().isString(),
];

const reviewValidators = [
  param('id').isMongoId(),
  body('status').isIn([
    VOLUNTEER_STATUS.APPROVED,
    VOLUNTEER_STATUS.REJECTED,
    VOLUNTEER_STATUS.CANCELLED,
  ]),
  body('schedule.date').optional().isISO8601(),
  body('schedule.timeSlot').optional().isString(),
  body('schedule.location').optional().isString(),
];

const register = asyncHandler(async (req, res) => {
  if (req.user.role !== ROLES.USER && req.user.role !== ROLES.ADMIN) {
    throw new ApiError(403, 'Only USER can register as volunteer');
  }

  const campaign = await Campaign.findById(req.body.campaignId);
  if (!campaign || campaign.status !== CAMPAIGN_STATUS.ACTIVE) {
    throw new ApiError(400, 'Campaign is not available for volunteering');
  }

  const existing = await VolunteerRegistration.findOne({
    user: req.user._id,
    campaign: req.body.campaignId,
  });
  if (existing) {
    throw new ApiError(409, 'Already registered for this campaign');
  }

  const registration = await VolunteerRegistration.create({
    user: req.user._id,
    campaign: req.body.campaignId,
    skills: req.body.skills || '',
    availabilityNote: req.body.availabilityNote || '',
  });

  await createNotification({
    userId: req.user._id,
    title: 'Volunteer registration submitted',
    message: 'Your volunteer registration is pending review.',
    type: 'volunteer',
    relatedId: registration._id.toString(),
  });

  return success(res, { registration }, 'Volunteer registered', 201);
});

const myRegistrations = asyncHandler(async (req, res) => {
  const registrations = await VolunteerRegistration.find({ user: req.user._id })
    .populate('campaign', 'title location startDate endDate status')
    .sort({ createdAt: -1 });
  return success(res, { registrations });
});

const listAll = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.campaignId) filter.campaign = req.query.campaignId;

  const registrations = await VolunteerRegistration.find(filter)
    .populate('user', 'fullName email phone')
    .populate('campaign', 'title location status')
    .populate('reviewedBy', 'fullName email')
    .sort({ createdAt: -1 });
  return success(res, { registrations });
});

const review = asyncHandler(async (req, res) => {
  const registration = await VolunteerRegistration.findById(req.params.id);
  if (!registration) {
    throw new ApiError(404, 'Volunteer registration not found');
  }

  registration.status = req.body.status;
  registration.reviewedBy = req.user._id;
  registration.reviewedAt = new Date();

  if (req.body.schedule) {
    registration.schedule = {
      date: req.body.schedule.date || registration.schedule.date,
      timeSlot: req.body.schedule.timeSlot || registration.schedule.timeSlot,
      location: req.body.schedule.location || registration.schedule.location,
    };
  }

  await registration.save();

  await createNotification({
    userId: registration.user,
    title: 'Volunteer registration updated',
    message: `Your volunteer status is now ${registration.status}.`,
    type: 'volunteer',
    relatedId: registration._id.toString(),
  });

  return success(res, { registration }, 'Volunteer registration reviewed');
});

module.exports = {
  registerValidators,
  reviewValidators,
  register,
  myRegistrations,
  listAll,
  review,
};
