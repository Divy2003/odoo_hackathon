const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const validateUser = require('../middlewares/validateUser');
const { auth } = require('../middlewares/auth');

router.post('/signup', validateUser, signup);
router.post('/login', validateUser, login);

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
