const express = require('express');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/commentController');

const router = express.Router();

function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return next();
  return authenticate(req, res, next);
}

router.get('/', optionalAuth, ctrl.targetTypeParam, validate, ctrl.listByTarget);
router.post('/', authenticate, ctrl.createValidators, validate, ctrl.create);
router.post('/:id/like', authenticate, ctrl.idParam, validate, ctrl.toggleLike);
router.delete('/:id', authenticate, ctrl.idParam, validate, ctrl.remove);

module.exports = router;
