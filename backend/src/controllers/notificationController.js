const { param } = require('express-validator');
const Notification = require('../models/Notification');
const { ApiError, success, asyncHandler } = require('../utils/api');

const idParam = [param('id').isMongoId()];

const listMine = asyncHandler(async (req, res) => {
  const filter = { user: req.user._id };
  if (req.query.unread === 'true') {
    filter.isRead = false;
  }

  const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(100);
  return success(res, { notifications });
});

const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }
  notification.isRead = true;
  await notification.save();
  return success(res, { notification }, 'Marked as read');
});

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  return success(res, null, 'All notifications marked as read');
});

module.exports = {
  idParam,
  listMine,
  markRead,
  markAllRead,
};
