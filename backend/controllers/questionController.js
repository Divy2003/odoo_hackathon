const Question = require('../models/Question');
const Tag = require('../models/Tag');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Get all questions with pagination and filtering
exports.getQuestions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      order = 'desc',
      tag,
      search,
      author
    } = req.query;

    const query = { isActive: true };
    
    // Filter by tag
    if (tag) {
      const tagDoc = await Tag.findOne({ name: tag.toLowerCase() });
      if (tagDoc) {
        query.tags = tagDoc._id;
      }
    }

    // Filter by author
    if (author) {
      query.author = author;
    }

    // Search in title and description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;

    const questions = await Question.find(query)
      .populate('author', 'name email reputation avatar')
      .populate('tags', 'name color')
      .populate('acceptedAnswer')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Question.countDocuments(query);

    res.json({
      questions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalQuestions: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single question by ID (no view increment)
exports.getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const question = await Question.findById(id)
      .populate('author', 'name email reputation avatar bio joinedAt')
      .populate('tags', 'name color description')
      .populate({
        path: 'answers',
        populate: {
          path: 'author',
          select: 'name email reputation avatar'
        }
      })
      .populate('acceptedAnswer');

    if (!question || !question.isActive) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Increment question view count only
exports.incrementQuestionView = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question || !question.isActive) {
      return res.status(404).json({ message: 'Question not found' });
    }
    question.views += 1;
    await question.save();
    res.json({ views: question.views });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new question
exports.createQuestion = async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    // Process tags
    const tagIds = [];
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        let tag = await Tag.findOne({ name: tagName.toLowerCase() });
        if (!tag) {
          tag = new Tag({ 
            name: tagName.toLowerCase(),
            createdBy: req.user.id 
          });
          await tag.save();
        }
        tag.questionCount += 1;
        await tag.save();
        tagIds.push(tag._id);
      }
    }

    const question = new Question({
      title: title.trim(),
      description,
      author: req.user.id,
      tags: tagIds
    });

    await question.save();
    
    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'name email reputation avatar')
      .populate('tags', 'name color');

    res.status(201).json({
      message: 'Question created successfully',
      question: populatedQuestion
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update question (only by author or admin)
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tags } = req.body;
    
    const question = await Question.findById(id);
    if (!question || !question.isActive) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is author or admin
    if (question.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this question' });
    }

    // Update fields
    if (title) question.title = title.trim();
    if (description) question.description = description;
    
    // Update tags if provided
    if (tags) {
      // Decrease count for old tags
      for (const oldTagId of question.tags) {
        const oldTag = await Tag.findById(oldTagId);
        if (oldTag) {
          oldTag.questionCount = Math.max(0, oldTag.questionCount - 1);
          await oldTag.save();
        }
      }

      // Process new tags
      const tagIds = [];
      for (const tagName of tags) {
        let tag = await Tag.findOne({ name: tagName.toLowerCase() });
        if (!tag) {
          tag = new Tag({ 
            name: tagName.toLowerCase(),
            createdBy: req.user.id 
          });
          await tag.save();
        }
        tag.questionCount += 1;
        await tag.save();
        tagIds.push(tag._id);
      }
      question.tags = tagIds;
    }

    question.lastActivity = new Date();
    await question.save();

    const updatedQuestion = await Question.findById(id)
      .populate('author', 'name email reputation avatar')
      .populate('tags', 'name color');

    res.json({
      message: 'Question updated successfully',
      question: updatedQuestion
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete question (only by author or admin)
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is author or admin
    if (question.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this question' });
    }

    // Soft delete
    question.isActive = false;
    await question.save();

    // Decrease tag counts
    for (const tagId of question.tags) {
      const tag = await Tag.findById(tagId);
      if (tag) {
        tag.questionCount = Math.max(0, tag.questionCount - 1);
        await tag.save();
      }
    }

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
