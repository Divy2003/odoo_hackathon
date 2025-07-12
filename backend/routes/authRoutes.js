const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const validateUser = require('../middlewares/validateUser');

router.post('/signup', validateUser, signup);
router.post('/login', login);

module.exports = router;
