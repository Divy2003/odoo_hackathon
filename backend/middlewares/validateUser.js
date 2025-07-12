module.exports = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Password validation
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  // This works for /api/auth/signup
  if (req.originalUrl.includes('signup')) {
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ message: 'Name must be at least 2 characters long' });
    }

    // Validate role if provided
    if (role && !['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }
  }

  next();
};
