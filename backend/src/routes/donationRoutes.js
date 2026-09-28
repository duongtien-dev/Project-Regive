const express = require('express');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/enums');
const ctrl = require('../controllers/donationController');

const router = express.Router();

router.use(authenticate);

router.post('/', ctrl.createValidators, validate, ctrl.create);
router.get('/me', ctrl.myDonations);
router.get('/', authorize(ROLES.ADMIN, ROLES.EMPLOYEE), ctrl.listAll);
router.get('/:id', ctrl.getById);
router.patch(
  '/:id/status',
  authorize(ROLES.ADMIN, ROLES.EMPLOYEE),
  ctrl.statusValidators,
  validate,
  ctrl.updateStatus
);

module.exports = router;
