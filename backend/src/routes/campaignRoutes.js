const express = require('express');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/enums');
const ctrl = require('../controllers/campaignController');

const router = express.Router();

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return next();
  return authenticate(req, res, next);
}

router.get('/', optionalAuth, ctrl.listPublic);
router.get(
  '/manage/all',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EMPLOYEE),
  ctrl.listAll
);
router.get('/:id', optionalAuth, ctrl.idParam, validate, ctrl.getById);
router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  ctrl.campaignBodyValidators,
  validate,
  ctrl.create
);
router.patch(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  ctrl.idParam,
  ctrl.campaignUpdateValidators,
  validate,
  ctrl.update
);
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  ctrl.idParam,
  validate,
  ctrl.remove
);

module.exports = router;
