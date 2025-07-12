const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  updateUser,
  toggleUserBan,
  getFlaggedContent,
  deleteContent,
  getAnalytics
} = require('../controllers/adminController');
const { auth, requireAdmin } = require('../middlewares/auth');

// All admin routes require authentication and admin role
router.use(auth);
router.use(requireAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.patch('/users/:id/toggle-ban', toggleUserBan);
router.get('/flagged-content', getFlaggedContent);
router.delete('/content/:type/:id', deleteContent);
router.get('/analytics', getAnalytics);

module.exports = router;
