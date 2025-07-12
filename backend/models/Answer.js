const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  content: { 
    type: String, 
    required: true 
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  question: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question', 
    required: true 
  },
  isAccepted: { 
    type: Boolean, 
    default: false 
  },
  votes: { 
    type: Number, 
    default: 0 
  },
  upvotes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  downvotes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  comments: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Comment' 
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
answerSchema.index({ author: 1 });
answerSchema.index({ question: 1 });
answerSchema.index({ createdAt: -1 });
answerSchema.index({ votes: -1 });
answerSchema.index({ isAccepted: -1 });

// Virtual for vote score
answerSchema.virtual('voteScore').get(function() {
  return this.upvotes.length - this.downvotes.length;
});

// Virtual for comment count
answerSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Ensure virtual fields are serialized
answerSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Answer', answerSchema);
