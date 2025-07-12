const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role = 'user' } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      lastLogin: new Date()
    });
    await newUser.save();

    // Don't return password in response
    const userResponse = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      reputation: newUser.reputation,
      joinedAt: newUser.joinedAt
    };

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Incorrect password' });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({
      id: user._id,
      role: user.role,
      email: user.email
    }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    // Don't return password in response
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      reputation: user.reputation,
      avatar: user.avatar,
      bio: user.bio,
      joinedAt: user.joinedAt,
      lastLogin: user.lastLogin
    };

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};
