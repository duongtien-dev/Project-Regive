const express = require('express');
const { param } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/enums');
const ctrl = require('../controllers/paymentController');

const router = express.Router();

// Sandbox webhook can be called without user JWT (simulates provider callback)
router.post('/sandbox/webhook', ctrl.sandboxWebhook);

router.use(authenticate);

router.post('/', ctrl.createValidators, validate, ctrl.create);
router.post('/sandbox/confirm', ctrl.confirmValidators, validate, ctrl.sandboxConfirm);
router.get('/me', ctrl.myPayments);
router.get('/', authorize(ROLES.ADMIN, ROLES.EMPLOYEE), ctrl.listAll);
router.get('/:id', [param('id').isMongoId()], validate, ctrl.getById);

module.exports = router;
