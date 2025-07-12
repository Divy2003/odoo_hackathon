const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: 50
  },
  description: { 
    type: String, 
    maxlength: 500,
    default: ''
  },
  color: { 
    type: String, 
    default: '#007bff' 
  },
  questionCount: { 
    type: Number, 
    default: 0 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, {
  timestamps: true
});

// Indexes for better query performance
tagSchema.index({ name: 1 });
tagSchema.index({ questionCount: -1 });
tagSchema.index({ createdAt: -1 });

// Pre-save middleware to ensure lowercase
tagSchema.pre('save', function(next) {
  this.name = this.name.toLowerCase();
  next();
});

module.exports = mongoose.model('Tag', tagSchema);
