const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: { 
    type: String, 
    required: true,
    maxlength: 1000
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  answer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Answer', 
    required: true 
  },
  mentions: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  isActive: { 
    type: Boolean, 
    default: true 
  },
  editHistory: [{
    content: String,
    editedAt: { type: Date, default: Date.now },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
commentSchema.index({ author: 1 });
commentSchema.index({ answer: 1 });
commentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
