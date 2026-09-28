const { body } = require('express-validator');
const User = require('../models/User');
const { ROLES } = require('../constants/enums');
const { ApiError, success, asyncHandler } = require('../utils/api');
const { signToken } = require('../services/common');

const registerValidators = [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  body('fullName').trim().notEmpty().withMessage('fullName required'),
  body('role')
    .optional()
    .isIn([ROLES.USER, ROLES.BENEFICIARY])
    .withMessage('Public register only allows USER or BENEFICIARY'),
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
    throw new ApiError(409, 'Email already registered');
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
  return success(res, { user: user.toSafeObject(), token }, 'Registered', 201);
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!user.isActive) {
    throw new ApiError(403, 'Account is inactive');
  }

  const token = signToken(user);
  return success(res, { user: user.toSafeObject(), token }, 'Logged in');
});

const me = asyncHandler(async (req, res) => {
  return success(res, { user: req.user.toSafeObject() });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
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
  return success(res, { user: user.toSafeObject() }, 'Profile updated');
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
