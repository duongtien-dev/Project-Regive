const express = require('express');
const { param } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/enums');
const ctrl = require('../controllers/aiController');

const router = express.Router();

router.use(authenticate, authorize(ROLES.ADMIN, ROLES.EMPLOYEE));

router.post('/assess-product', ctrl.assessValidators, validate, ctrl.assessProduct);
router.get('/pending', ctrl.listPending);
router.get(
  '/products/:productId',
  [param('productId').isMongoId()],
  validate,
  ctrl.listByProduct
);
router.get('/assessments/:id', ctrl.idParam, validate, ctrl.getById);
router.post(
  '/assessments/:id/confirm',
  ctrl.reviewValidators,
  validate,
  ctrl.confirm
);
router.post(
  '/assessments/:id/reject',
  ctrl.idParam,
  validate,
  ctrl.reject
);

module.exports = router;
