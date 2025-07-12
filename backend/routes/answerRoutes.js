const express = require('express');
const router = express.Router();
const {
  getAnswersByQuestion,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  acceptAnswer,
  acceptAnswerByOwner,
  rejectAnswer,
  getUserAnswers
} = require('../controllers/answerController');
const { auth } = require('../middlewares/auth');

// Public routes
router.get('/question/:questionId', getAnswersByQuestion);

// Protected routes (require authentication)
router.get('/user/me', auth, getUserAnswers); // Get current user's answers
router.post('/question/:questionId', auth, createAnswer);
router.put('/:id', auth, updateAnswer);
router.delete('/:id', auth, deleteAnswer);
router.patch('/:id/accept', auth, acceptAnswer);
router.patch('/:id/accept-by-owner', auth, acceptAnswerByOwner);
router.patch('/:id/reject', auth, rejectAnswer);

module.exports = router;
