const express = require('express');
const { param } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/enums');
const ctrl = require('../controllers/orderController');

const router = express.Router();

router.use(authenticate);

router.post('/', ctrl.createValidators, validate, ctrl.create);
router.get('/me', ctrl.myOrders);
router.get('/', authorize(ROLES.ADMIN, ROLES.EMPLOYEE), ctrl.listAll);
router.get('/:id', [param('id').isMongoId()], validate, ctrl.getById);
router.patch(
  '/:id/status',
  authorize(ROLES.ADMIN, ROLES.EMPLOYEE),
  ctrl.statusValidators,
  validate,
  ctrl.updateStatus
);

module.exports = router;
