const mongoose = require('mongoose');
const { VOLUNTEER_STATUS } = require('../constants/enums');

const volunteerRegistrationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    status: {
      type: String,
      enum: Object.values(VOLUNTEER_STATUS),
      default: VOLUNTEER_STATUS.PENDING,
    },
    skills: { type: String, default: '' },
    availabilityNote: { type: String, default: '' },
    schedule: {
      date: { type: Date, default: null },
      timeSlot: { type: String, default: '' },
      location: { type: String, default: '' },
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

volunteerRegistrationSchema.index({ user: 1, campaign: 1 }, { unique: true });

module.exports = mongoose.model('VolunteerRegistration', volunteerRegistrationSchema);
