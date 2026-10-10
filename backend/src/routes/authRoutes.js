const express = require('express');
const { param } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const { ROLES } = require('../constants/enums');
const ctrl = require('../controllers/authController');

const router = express.Router();

router.post('/register', authLimiter, ctrl.registerValidators, validate, ctrl.register);
router.post('/login', authLimiter, ctrl.loginValidators, validate, ctrl.login);
router.get('/me', authenticate, ctrl.me);
router.patch(
  '/me',
  authenticate,
  ctrl.updateProfileValidators,
  validate,
  ctrl.updateProfile
);
router.get('/users', authenticate, authorize(ROLES.ADMIN), ctrl.listUsers);
router.patch(
  '/users/:id/role',
  authenticate,
  authorize(ROLES.ADMIN),
  [param('id').isMongoId()],
  ctrl.updateUserRoleValidators,
  validate,
  ctrl.updateUserRole
);
router.patch(
  '/users/:id/status',
  authenticate,
  authorize(ROLES.ADMIN),
  [param('id').isMongoId()],
  ctrl.updateUserStatusValidators,
  validate,
  ctrl.updateUserStatus
);

module.exports = router;
