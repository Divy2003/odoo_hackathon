const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  targetType: { 
    type: String, 
    enum: ['question', 'answer'], 
    required: true 
  },
  targetId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  voteType: { 
    type: String, 
    enum: ['upvote', 'downvote'], 
    required: true 
  }
}, {
  timestamps: true
});

// Compound index to ensure one vote per user per target
voteSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

// Indexes for better query performance
voteSchema.index({ targetType: 1, targetId: 1 });
voteSchema.index({ user: 1 });

module.exports = mongoose.model('Vote', voteSchema);
