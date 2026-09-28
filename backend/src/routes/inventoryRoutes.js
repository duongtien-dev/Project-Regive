const express = require('express');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/enums');
const ctrl = require('../controllers/inventoryController');

const router = express.Router();

router.use(authenticate, authorize(ROLES.ADMIN, ROLES.EMPLOYEE));

router.get('/summary', ctrl.inventorySummary);
router.get('/transactions', ctrl.listTransactions);
router.post('/stock-in', ctrl.stockValidators, validate, ctrl.stockIn);
router.post('/stock-out', ctrl.stockValidators, validate, ctrl.stockOut);
router.post('/adjust', ctrl.adjustValidators, validate, ctrl.adjust);

module.exports = router;
