const express = require('express');
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

module.exports = router;
