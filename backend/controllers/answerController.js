const Answer = require('../models/Answer');
const Question = require('../models/Question');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Get answers for a specific question
exports.getAnswersByQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { page = 1, limit = 10, sortBy = 'votes' } = req.query;

    const question = await Question.findById(questionId);
    if (!question || !question.isActive) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const skip = (page - 1) * limit;
    let sortOrder = {};
    
    if (sortBy === 'votes') {
      sortOrder = { votes: -1, createdAt: -1 };
    } else if (sortBy === 'newest') {
      sortOrder = { createdAt: -1 };
    } else if (sortBy === 'oldest') {
      sortOrder = { createdAt: 1 };
    }

    const answers = await Answer.find({
      question: questionId,
      isActive: true
    })
      .populate('author', 'name email reputation avatar')
      .sort(sortOrder)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Answer.countDocuments({ 
      question: questionId, 
      isActive: true 
    });

    res.json({
      answers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalAnswers: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new answer
exports.createAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Answer content is required' });
    }

    const question = await Question.findById(questionId).populate('author');
    if (!question || !question.isActive) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = new Answer({
      content: content.trim(),
      author: req.user.id,
      question: questionId
    });

    await answer.save();

    // Add answer to question's answers array
    question.answers.push(answer._id);
    question.lastActivity = new Date();
    await question.save();

    // Create notification for question author (if not answering own question)
    if (question.author._id.toString() !== req.user.id) {
      const answerAuthor = await User.findById(req.user.id);
      const notification = new Notification({
        recipient: question.author._id,
        sender: req.user.id,
        type: 'answer_posted',
        title: 'New Answer to Your Question',
        message: `${answerAuthor.name} answered your question: "${question.title}"`,
        relatedQuestion: questionId,
        relatedAnswer: answer._id
      });
      await notification.save();
    }

    const populatedAnswer = await Answer.findById(answer._id)
      .populate('author', 'name email reputation avatar');

    res.status(201).json({
      message: 'Answer created successfully',
      answer: populatedAnswer
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update answer (only by author or admin)
exports.updateAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Answer content is required' });
    }

    const answer = await Answer.findById(id);
    if (!answer || !answer.isActive) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check if user is author or admin
    if (answer.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this answer' });
    }

    // Save edit history
    answer.editHistory.push({
      content: answer.content,
      editedBy: req.user.id
    });

    answer.content = content.trim();
    await answer.save();

    // Update question's last activity
    await Question.findByIdAndUpdate(answer.question, {
      lastActivity: new Date()
    });

    const updatedAnswer = await Answer.findById(id)
      .populate('author', 'name email reputation avatar');

    res.json({
      message: 'Answer updated successfully',
      answer: updatedAnswer
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete answer (only by author or admin)
exports.deleteAnswer = async (req, res) => {
  try {
    const { id } = req.params;

    const answer = await Answer.findById(id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check if user is author or admin
    if (answer.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this answer' });
    }

    // Soft delete
    answer.isActive = false;
    await answer.save();

    // Remove from question's answers array
    await Question.findByIdAndUpdate(answer.question, {
      $pull: { answers: answer._id },
      lastActivity: new Date()
    });

    // If this was the accepted answer, unset it
    await Question.findOneAndUpdate(
      { acceptedAnswer: answer._id },
      { $unset: { acceptedAnswer: 1 } }
    );

    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Accept answer (only by question author)
exports.acceptAnswer = async (req, res) => {
  try {
    const { id } = req.params;

    const answer = await Answer.findById(id);
    if (!answer || !answer.isActive) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const question = await Question.findById(answer.question);
    if (!question || !question.isActive) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is question author
    if (question.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only question author can accept answers' });
    }

    // Unset previous accepted answer
    if (question.acceptedAnswer) {
      await Answer.findByIdAndUpdate(question.acceptedAnswer, {
        isAccepted: false
      });
    }

    // Set new accepted answer
    answer.isAccepted = true;
    await answer.save();

    question.acceptedAnswer = answer._id;
    question.lastActivity = new Date();
    await question.save();

    // Create notification for answer author (if not accepting own answer)
    if (answer.author.toString() !== req.user.id) {
      const questionAuthor = await User.findById(req.user.id);
      const notification = new Notification({
        recipient: answer.author,
        sender: req.user.id,
        type: 'answer_accepted',
        title: 'Your Answer Was Accepted!',
        message: `${questionAuthor.name} accepted your answer to: "${question.title}"`,
        relatedQuestion: question._id,
        relatedAnswer: answer._id
      });
      await notification.save();
    }

    res.json({
      message: 'Answer accepted successfully',
      answer: await Answer.findById(id).populate('author', 'name email reputation avatar')
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Unaccept answer (only by question author)
exports.unacceptAnswer = async (req, res) => {
  try {
    const { id } = req.params;

    const answer = await Answer.findById(id);
    if (!answer || !answer.isActive) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const question = await Question.findById(answer.question);
    if (!question || !question.isActive) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is question author
    if (question.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only question author can unaccept answers' });
    }

    answer.isAccepted = false;
    await answer.save();

    question.acceptedAnswer = null;
    question.lastActivity = new Date();
    await question.save();

    res.json({
      message: 'Answer unaccepted successfully',
      answer: await Answer.findById(id).populate('author', 'name email reputation avatar')
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get answers by user (for profile)
exports.getUserAnswers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const answers = await Answer.find({
      author: req.user.id,
      isActive: true
    })
      .populate('author', 'name email reputation avatar')
      .populate('question', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Answer.countDocuments({
      author: req.user.id,
      isActive: true
    });

    res.json({
      answers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalAnswers: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get user answers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Accept answer by question owner (new workflow)
exports.acceptAnswerByOwner = async (req, res) => {
  try {
    const { id } = req.params;

    const answer = await Answer.findById(id).populate('question');
    if (!answer || !answer.isActive) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check if user is the question owner
    if (answer.question.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only question owner can accept answers' });
    }

    // Update answer status
    answer.status = 'accepted';
    answer.isAccepted = true;
    answer.reviewedAt = new Date();
    await answer.save();

    // Create notification for answer author
    if (answer.author.toString() !== req.user.id) {
      const notification = new Notification({
        recipient: answer.author,
        sender: req.user.id,
        type: 'answer_accepted',
        title: 'Your Answer Was Accepted!',
        message: 'Your answer has been accepted!',
        relatedQuestion: answer.question._id,
        relatedAnswer: answer._id
      });
      await notification.save();
    }

    res.json({
      message: 'Answer accepted successfully',
      answer: await Answer.findById(id).populate('author', 'name email reputation avatar')
    });
  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject answer by question owner
exports.rejectAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const answer = await Answer.findById(id).populate('question');
    if (!answer || !answer.isActive) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check if user is the question owner
    if (answer.question.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only question owner can reject answers' });
    }

    // Update answer status
    answer.status = 'rejected';
    answer.isAccepted = false;
    answer.reviewedAt = new Date();
    if (reason) {
      answer.rejectionReason = reason;
    }
    await answer.save();

    // Create notification for answer author
    if (answer.author.toString() !== req.user.id) {
      const notification = new Notification({
        recipient: answer.author,
        sender: req.user.id,
        type: 'answer_rejected',
        title: 'Your Answer Was Rejected',
        message: reason ? `Your answer was rejected: ${reason}` : 'Your answer was rejected',
        relatedQuestion: answer.question._id,
        relatedAnswer: answer._id
      });
      await notification.save();
    }

    res.json({
      message: 'Answer rejected successfully',
      answer: await Answer.findById(id).populate('author', 'name email reputation avatar')
    });
  } catch (error) {
    console.error('Reject answer error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
