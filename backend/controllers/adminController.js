const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Tag = require('../models/Tag');
const Notification = require('../models/Notification');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Basic counts
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalQuestions = await Question.countDocuments({ isActive: true });
    const totalAnswers = await Answer.countDocuments({ isActive: true });
    const totalTags = await Tag.countDocuments({ isActive: true });

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo },
      isActive: true 
    });
    const recentQuestions = await Question.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo },
      isActive: true 
    });
    const recentAnswers = await Answer.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo },
      isActive: true 
    });

    // Top users by reputation
    const topUsers = await User.find({ isActive: true })
      .sort({ reputation: -1 })
      .limit(10)
      .select('name email reputation joinedAt');

    // Most popular tags
    const popularTags = await Tag.find({ isActive: true })
      .sort({ questionCount: -1 })
      .limit(10)
      .select('name questionCount color');

    // Recent questions
    const recentQuestionsList = await Question.find({ isActive: true })
      .populate('author', 'name email')
      .populate('tags', 'name color')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title author tags createdAt views votes');

    res.json({
      overview: {
        totalUsers,
        totalQuestions,
        totalAnswers,
        totalTags
      },
      recentActivity: {
        newUsers: recentUsers,
        newQuestions: recentQuestions,
        newAnswers: recentAnswers
      },
      topUsers,
      popularTags,
      recentQuestions: recentQuestionsList
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all users with pagination
exports.getUsers = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { page = 1, limit = 20, search, role, isActive } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) {
      query.role = role;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { id } = req.params;
    const { role, isActive, reputation } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields
    if (role && ['user', 'admin'].includes(role)) {
      user.role = role;
    }
    if (isActive !== undefined) {
      user.isActive = isActive;
    }
    if (reputation !== undefined) {
      user.reputation = reputation;
    }

    await user.save();

    const updatedUser = await User.findById(id).select('-password');
    res.json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Ban/unban user
exports.toggleUserBan = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cannot ban other admins
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot ban admin users' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      message: `User ${user.isActive ? 'unbanned' : 'banned'} successfully`,
      user: await User.findById(id).select('-password')
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get flagged content (questions/answers that need moderation)
exports.getFlaggedContent = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // For now, we'll return content with negative votes as "flagged"
    // In a real app, you'd have a proper flagging system
    const flaggedQuestions = await Question.find({ 
      votes: { $lt: -2 }, 
      isActive: true 
    })
      .populate('author', 'name email')
      .populate('tags', 'name')
      .sort({ votes: 1 })
      .limit(10);

    const flaggedAnswers = await Answer.find({ 
      votes: { $lt: -2 }, 
      isActive: true 
    })
      .populate('author', 'name email')
      .populate('question', 'title')
      .sort({ votes: 1 })
      .limit(10);

    res.json({
      flaggedQuestions,
      flaggedAnswers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete content (admin only)
exports.deleteContent = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { type, id } = req.params;

    if (type === 'question') {
      const question = await Question.findById(id);
      if (!question) {
        return res.status(404).json({ message: 'Question not found' });
      }
      question.isActive = false;
      await question.save();
    } else if (type === 'answer') {
      const answer = await Answer.findById(id);
      if (!answer) {
        return res.status(404).json({ message: 'Answer not found' });
      }
      answer.isActive = false;
      await answer.save();
    } else {
      return res.status(400).json({ message: 'Invalid content type' });
    }

    res.json({ message: `${type} deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get platform analytics
exports.getAnalytics = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Daily activity over the specified period
    const dailyActivity = await Question.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isActive: true
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          questions: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // User growth
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          isActive: true
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Top performing content
    const topQuestions = await Question.find({ isActive: true })
      .populate('author', 'name')
      .sort({ votes: -1, views: -1 })
      .limit(10)
      .select('title author votes views createdAt');

    res.json({
      dailyActivity,
      userGrowth,
      topQuestions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
