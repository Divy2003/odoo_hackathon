module.exports = (req, res, next) => {
  const { name, email, password, userType } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  // This works for /api/auth/signup
  if (req.originalUrl.includes('signup') && (!name || !userType)) {
    return res.status(400).json({ message: 'All fields required for signup' });
  }

  next();
};
