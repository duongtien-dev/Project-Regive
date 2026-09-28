const express = require('express');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/notificationController');

const router = express.Router();

router.use(authenticate);

router.get('/', ctrl.listMine);
router.patch('/read-all', ctrl.markAllRead);
router.patch('/:id/read', ctrl.idParam, validate, ctrl.markRead);

module.exports = router;
