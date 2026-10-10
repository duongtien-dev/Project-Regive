const { body, param, query } = require('express-validator');
const Comment = require('../models/Comment');
const Campaign = require('../models/Campaign');
const Product = require('../models/Product');
const { ApiError, success, asyncHandler } = require('../utils/api');

const targetTypeParam = [
  query('targetType').isIn(['campaign', 'product']),
  query('targetId').isMongoId(),
];

const createValidators = [
  body('targetType').isIn(['campaign', 'product']),
  body('targetId').isMongoId(),
  body('content').trim().isLength({ min: 1, max: 2000 }),
];

const idParam = [param('id').isMongoId()];

async function assertTargetExists(targetType, targetId) {
  if (targetType === 'campaign') {
    const campaign = await Campaign.findById(targetId);
    if (!campaign) throw new ApiError(404, 'Không tìm thấy chiến dịch');
  } else {
    const product = await Product.findById(targetId);
    if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm');
  }
}

const toCommentPayload = (comment, userId) => ({
  _id: comment._id,
  targetType: comment.targetType,
  targetId: comment.targetId,
  author: comment.author,
  content: comment.content,
  likeCount: (comment.likes || []).length,
  likedByMe: userId
    ? (comment.likes || []).some((id) => id.toString() === userId)
    : false,
  createdAt: comment.createdAt,
  updatedAt: comment.updatedAt,
});

const listByTarget = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
  const skip = (page - 1) * limit;

  const filter = { targetType, targetId, isDeleted: false };
  const [total, comments] = await Promise.all([
    Comment.countDocuments(filter),
    Comment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'fullName')
      .lean(),
  ]);

  const userId = req.user ? req.user._id.toString() : null;
  const items = comments.map((c) => toCommentPayload(c, userId));

  return success(res, { comments: items, total, page, limit });
});

const create = asyncHandler(async (req, res) => {
  const { targetType, targetId, content } = req.body;
  await assertTargetExists(targetType, targetId);

  const comment = await Comment.create({
    targetType,
    targetId,
    content,
    author: req.user._id,
  });
  await comment.populate('author', 'fullName');

  return success(
    res,
    { comment: toCommentPayload(comment, req.user._id.toString()) },
    'Bình luận đã được đăng',
    201
  );
});

const toggleLike = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment || comment.isDeleted) {
    throw new ApiError(404, 'Không tìm thấy bình luận');
  }

  const userId = req.user._id;
  const alreadyLiked = comment.likes.some((id) => id.toString() === userId.toString());

  if (alreadyLiked) {
    comment.likes = comment.likes.filter((id) => id.toString() !== userId.toString());
  } else {
    comment.likes.push(userId);
  }
  await comment.save();

  return success(res, {
    comment: {
      _id: comment._id,
      likeCount: comment.likes.length,
      likedByMe: !alreadyLiked,
    },
  });
});

const remove = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    throw new ApiError(404, 'Không tìm thấy bình luận');
  }

  const isOwner = comment.author.toString() === req.user._id.toString();
  const isStaff = ['ADMIN', 'EMPLOYEE'].includes(req.user.role);
  if (!isOwner && !isStaff) {
    throw new ApiError(403, 'Bạn không có quyền xóa bình luận này');
  }

  await Comment.findByIdAndDelete(req.params.id);
  return success(res, null, 'Bình luận đã được xóa');
});

module.exports = {
  targetTypeParam,
  createValidators,
  idParam,
  listByTarget,
  create,
  toggleLike,
  remove,
};
