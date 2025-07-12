const express = require('express');
const router = express.Router();
const {
  vote,
  getUserVote,
  getVoteStats,
  getUserVotes
} = require('../controllers/voteController');
const { auth } = require('../middlewares/auth');

// All vote routes require authentication
router.post('/', auth, vote);
router.get('/user/:targetType/:targetId', auth, getUserVote);
router.get('/stats/:targetType/:targetId', getVoteStats);
router.get('/user', auth, getUserVotes);

module.exports = router;
