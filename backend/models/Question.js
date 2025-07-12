const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  description: { 
    type: String, 
    required: true 
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  tags: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tag' 
  }],
  answers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Answer' 
  }],
  acceptedAnswer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Answer',
    default: null
  },
  views: { 
    type: Number, 
    default: 0 
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
  isActive: { 
    type: Boolean, 
    default: true 
  },
  isFeatured: { 
    type: Boolean, 
    default: false 
  },
  lastActivity: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

// Indexes for better query performance
questionSchema.index({ author: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ createdAt: -1 });
questionSchema.index({ lastActivity: -1 });
questionSchema.index({ votes: -1 });
questionSchema.index({ views: -1 });

// Virtual for answer count
questionSchema.virtual('answerCount').get(function() {
  return this.answers ? this.answers.length : 0;
});

// Virtual for vote score
questionSchema.virtual('voteScore').get(function() {
  const upvotes = this.upvotes ? this.upvotes.length : 0;
  const downvotes = this.downvotes ? this.downvotes.length : 0;
  return upvotes - downvotes;
});

// Ensure virtual fields are serialized
questionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Question', questionSchema);
