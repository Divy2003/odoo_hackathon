const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: [
      'answer_posted',      // Someone answered your question
      'answer_accepted',    // Your answer was accepted
      'comment_posted',     // Someone commented on your answer
      'mention',           // Someone mentioned you using @username
      'question_upvoted',  // Your question was upvoted
      'answer_upvoted',    // Your answer was upvoted
      'admin_message'      // Platform-wide admin message
    ], 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  relatedQuestion: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question' 
  },
  relatedAnswer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Answer' 
  },
  isRead: { 
    type: Boolean, 
    default: false 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ isActive: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
