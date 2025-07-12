const express = require('express');
const router = express.Router();
const {
  getTags,
  getTag,
  createTag,
  updateTag,
  deleteTag,
  getPopularTags,
  searchTags,
  getQuestionsByTag
} = require('../controllers/tagController');
const { auth, requireAdmin } = require('../middlewares/auth');

// Public routes
router.get('/', getTags);
router.get('/popular', getPopularTags);
router.get('/search', searchTags);
router.get('/:identifier', getTag);
router.get('/:tagName/questions', getQuestionsByTag);

// Protected routes (require authentication)
router.post('/', auth, createTag);
router.put('/:id', auth, updateTag);

// Admin only routes
router.delete('/:id', auth, requireAdmin, deleteTag);

module.exports = router;
