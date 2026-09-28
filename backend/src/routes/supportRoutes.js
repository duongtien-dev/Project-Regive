const express = require('express');
const { param } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/enums');
const ctrl = require('../controllers/supportController');

const router = express.Router();

router.use(authenticate);

router.post('/', ctrl.createValidators, validate, ctrl.create);
router.get('/me', ctrl.myRequests);
router.get('/', authorize(ROLES.ADMIN, ROLES.EMPLOYEE), ctrl.listAll);
router.get('/:id', [param('id').isMongoId()], validate, ctrl.getById);
router.patch(
  '/:id/review',
  authorize(ROLES.ADMIN, ROLES.EMPLOYEE),
  ctrl.reviewValidators,
  validate,
  ctrl.review
);
router.post(
  '/:id/confirm-received',
  [param('id').isMongoId()],
  validate,
  ctrl.confirmReceived
);

module.exports = router;
