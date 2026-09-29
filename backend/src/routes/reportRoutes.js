const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/enums');
const ctrl = require('../controllers/reportController');

const router = express.Router();

router.get('/public-impact', ctrl.publicImpact);
router.get('/transparency-ledger', ctrl.transparencyLedger);

router.get(
  '/overview',
  authenticate,
  authorize(ROLES.ADMIN, ROLES.EMPLOYEE),
  ctrl.overview
);

module.exports = router;
