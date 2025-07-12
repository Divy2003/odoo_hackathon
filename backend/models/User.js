const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['guest', 'user', 'admin'],
    default: 'user'
  },
  reputation: { type: Number, default: 0 },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  joinedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

module.exports = mongoose.model('User', userSchema);
