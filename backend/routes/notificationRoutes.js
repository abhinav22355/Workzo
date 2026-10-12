const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
} = require('../controllers/notificationController');
const { requireAuth } = require('../middleware/authMiddleware');

router.get('/', requireAuth, getNotifications);
router.put('/:id/read', requireAuth, markAsRead);

module.exports = router;
