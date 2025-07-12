const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  sendAdminMessage,
  getNotificationStats
} = require('../controllers/notificationController');
const { auth, requireAdmin } = require('../middlewares/auth');

// All notification routes require authentication
router.get('/', auth, getNotifications);
router.get('/unread-count', auth, getUnreadCount);
router.patch('/:id/read', auth, markAsRead);
router.patch('/mark-all-read', auth, markAllAsRead);
router.delete('/:id', auth, deleteNotification);

// Admin only routes
router.post('/admin-message', auth, requireAdmin, sendAdminMessage);
router.get('/stats', auth, requireAdmin, getNotificationStats);

module.exports = router;
