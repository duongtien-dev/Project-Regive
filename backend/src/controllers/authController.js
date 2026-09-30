const { body } = require('express-validator');
const User = require('../models/User');
const { ROLES } = require('../constants/enums');
const { ApiError, success, asyncHandler } = require('../utils/api');
const { signToken } = require('../services/common');

const registerValidators = [
  body('email').isEmail().withMessage('Email không hợp lệ'),
  body('password').isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  body('fullName').trim().notEmpty().withMessage('Vui lòng nhập họ tên'),
  body('role')
    .optional()
    .isIn([ROLES.USER, ROLES.BENEFICIARY])
    .withMessage('Đăng ký công khai chỉ cho phép vai trò USER hoặc BENEFICIARY'),
];

const loginValidators = [
  body('email').isEmail(),
  body('password').notEmpty(),
];

const updateProfileValidators = [
  body('fullName').optional().trim().notEmpty(),
  body('phone').optional().isString(),
  body('address').optional().isString(),
  body('beneficiaryInfo.householdSize').optional().isInt({ min: 1 }),
  body('beneficiaryInfo.note').optional().isString(),
];

const register = asyncHandler(async (req, res) => {
  const { email, password, fullName, phone, address, role } = req.body;
  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    throw new ApiError(409, 'Email đã được đăng ký');
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    email,
    passwordHash,
    fullName,
    phone: phone || '',
    address: address || '',
    role: role === ROLES.BENEFICIARY ? ROLES.BENEFICIARY : ROLES.USER,
  });

  const token = signToken(user);
  return success(res, { user: user.toSafeObject(), token }, 'Đăng ký thành công', 201);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Email hoặc mật khẩu không đúng');
  }
  if (!user.isActive) {
    throw new ApiError(403, 'Tài khoản đang bị vô hiệu hóa');
  }

  const token = signToken(user);
  return success(res, { user: user.toSafeObject(), token }, 'Đăng nhập thành công');
});

const me = asyncHandler(async (req, res) => {
  return success(res, { user: req.user.toSafeObject() });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'Không tìm thấy người dùng');
  }

  const { fullName, phone, address, beneficiaryInfo } = req.body;
  if (fullName !== undefined) user.fullName = fullName;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (beneficiaryInfo) {
    if (beneficiaryInfo.householdSize !== undefined) {
      user.beneficiaryInfo.householdSize = beneficiaryInfo.householdSize;
    }
    if (beneficiaryInfo.note !== undefined) {
      user.beneficiaryInfo.note = beneficiaryInfo.note;
    }
  }

  await user.save();
  return success(res, { user: user.toSafeObject() }, 'Cập nhật hồ sơ thành công');
});

const listUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  const users = await User.find(filter).sort({ createdAt: -1 });
  return success(res, { users: users.map((u) => u.toSafeObject()) });
});

module.exports = {
  registerValidators,
  loginValidators,
  updateProfileValidators,
  register,
  login,
  me,
  updateProfile,
  listUsers,
};
