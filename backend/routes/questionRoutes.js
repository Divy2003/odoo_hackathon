const express = require('express');
const router = express.Router();
const {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion
} = require('../controllers/questionController');
const { auth, requireAdmin } = require('../middlewares/auth');

// Public routes
router.get('/', getQuestions);
router.get('/:id', getQuestionById);
router.post('/:id/view', require('../controllers/questionController').incrementQuestionView);

// Protected routes (require authentication)
router.post('/', auth, createQuestion);
router.put('/:id', auth, updateQuestion);
router.delete('/:id', auth, deleteQuestion);

module.exports = router;
