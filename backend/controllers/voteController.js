const Vote = require('../models/Vote');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Vote on a question or answer
exports.vote = async (req, res) => {
  try {
    const { targetType, targetId, voteType } = req.body;

    // Validate input
    if (!['question', 'answer'].includes(targetType)) {
      return res.status(400).json({ message: 'Invalid target type' });
    }

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }

    // Check if target exists
    let target;
    if (targetType === 'question') {
      target = await Question.findById(targetId).populate('author');
    } else {
      target = await Answer.findById(targetId).populate('author');
    }

    if (!target || !target.isActive) {
      return res.status(404).json({ message: `${targetType} not found` });
    }

    // Check if user is trying to vote on their own content
    if (target.author._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot vote on your own content' });
    }

    // Check if user has already voted
    const existingVote = await Vote.findOne({
      user: req.user.id,
      targetType,
      targetId
    });

    let voteChange = 0;
    let message = '';

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote (toggle off)
        await Vote.deleteOne({ _id: existingVote._id });
        voteChange = voteType === 'upvote' ? -1 : 1;
        message = 'Vote removed';

        // Remove from target's vote arrays
        if (voteType === 'upvote') {
          target.upvotes.pull(req.user.id);
        } else {
          target.downvotes.pull(req.user.id);
        }
      } else {
        // Change vote type
        existingVote.voteType = voteType;
        await existingVote.save();
        voteChange = voteType === 'upvote' ? 2 : -2;
        message = `Vote changed to ${voteType}`;

        // Update target's vote arrays
        if (voteType === 'upvote') {
          target.downvotes.pull(req.user.id);
          target.upvotes.push(req.user.id);
        } else {
          target.upvotes.pull(req.user.id);
          target.downvotes.push(req.user.id);
        }
      }
    } else {
      // Create new vote
      const newVote = new Vote({
        user: req.user.id,
        targetType,
        targetId,
        voteType
      });
      await newVote.save();
      voteChange = voteType === 'upvote' ? 1 : -1;
      message = `${voteType} added`;

      // Add to target's vote arrays
      if (voteType === 'upvote') {
        target.upvotes.push(req.user.id);
      } else {
        target.downvotes.push(req.user.id);
      }
    }

    // Update vote count
    target.votes += voteChange;
    await target.save();

    // Create notification for upvotes (not downvotes to avoid negativity)
    if (voteType === 'upvote' && voteChange > 0) {
      const voter = await User.findById(req.user.id);
      const notificationType = targetType === 'question' ? 'question_upvoted' : 'answer_upvoted';
      const notification = new Notification({
        recipient: target.author._id,
        sender: req.user.id,
        type: notificationType,
        title: `Your ${targetType} was upvoted!`,
        message: `${voter.name} upvoted your ${targetType}`,
        relatedQuestion: targetType === 'question' ? targetId : target.question,
        relatedAnswer: targetType === 'answer' ? targetId : null
      });
      await notification.save();
    }

    // Update user reputation (basic system)
    if (voteChange !== 0) {
      const reputationChange = voteType === 'upvote' ? voteChange * 10 : voteChange * 2;
      await User.findByIdAndUpdate(target.author._id, {
        $inc: { reputation: reputationChange }
      });
    }

    res.json({
      message,
      voteCount: target.votes,
      userVote: existingVote && existingVote.voteType === voteType ? null : voteType
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's vote on a specific target
exports.getUserVote = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    if (!['question', 'answer'].includes(targetType)) {
      return res.status(400).json({ message: 'Invalid target type' });
    }

    const vote = await Vote.findOne({
      user: req.user.id,
      targetType,
      targetId
    });

    res.json({
      userVote: vote ? vote.voteType : null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get vote statistics for a target
exports.getVoteStats = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;

    if (!['question', 'answer'].includes(targetType)) {
      return res.status(400).json({ message: 'Invalid target type' });
    }

    const upvotes = await Vote.countDocuments({
      targetType,
      targetId,
      voteType: 'upvote'
    });

    const downvotes = await Vote.countDocuments({
      targetType,
      targetId,
      voteType: 'downvote'
    });

    res.json({
      upvotes,
      downvotes,
      total: upvotes - downvotes
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all votes by a user (for profile/activity)
exports.getUserVotes = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const votes = await Vote.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: 'targetId',
        select: 'title content author',
        populate: {
          path: 'author',
          select: 'name'
        }
      });

    const total = await Vote.countDocuments({ user: req.user.id });

    res.json({
      votes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalVotes: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
