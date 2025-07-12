const Tag = require('../models/Tag');
const Question = require('../models/Question');

// Get all tags with pagination and search
exports.getTags = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search,
      sortBy = 'questionCount',
      order = 'desc'
    } = req.query;

    const query = { isActive: true };
    
    // Search in tag name and description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;

    const tags = await Tag.find(query)
      .populate('createdBy', 'name')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Tag.countDocuments(query);

    res.json({
      tags,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTags: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single tag by name or ID
exports.getTag = async (req, res) => {
  try {
    const { identifier } = req.params;
    
    // Try to find by ID first, then by name
    let tag = await Tag.findById(identifier).populate('createdBy', 'name');
    if (!tag) {
      tag = await Tag.findOne({ name: identifier.toLowerCase() }).populate('createdBy', 'name');
    }

    if (!tag || !tag.isActive) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    // Get recent questions with this tag
    const recentQuestions = await Question.find({ 
      tags: tag._id, 
      isActive: true 
    })
      .populate('author', 'name reputation avatar')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('title author createdAt views votes answerCount');

    res.json({
      tag,
      recentQuestions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new tag (authenticated users)
exports.createTag = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Tag name is required' });
    }

    const tagName = name.trim().toLowerCase();

    // Check if tag already exists
    const existingTag = await Tag.findOne({ name: tagName });
    if (existingTag) {
      return res.status(400).json({ message: 'Tag already exists' });
    }

    const tag = new Tag({
      name: tagName,
      description: description?.trim() || '',
      color: color || '#007bff',
      createdBy: req.user.id
    });

    await tag.save();

    const populatedTag = await Tag.findById(tag._id).populate('createdBy', 'name');

    res.status(201).json({
      message: 'Tag created successfully',
      tag: populatedTag
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update tag (only by creator or admin)
exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, color } = req.body;

    const tag = await Tag.findById(id);
    if (!tag || !tag.isActive) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    // Check if user is creator or admin
    if (tag.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this tag' });
    }

    // Update fields (name cannot be changed to maintain consistency)
    if (description !== undefined) tag.description = description.trim();
    if (color) tag.color = color;

    await tag.save();

    const updatedTag = await Tag.findById(id).populate('createdBy', 'name');

    res.json({
      message: 'Tag updated successfully',
      tag: updatedTag
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete tag (only admin)
exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    // Soft delete
    tag.isActive = false;
    await tag.save();

    // Remove tag from all questions
    await Question.updateMany(
      { tags: tag._id },
      { $pull: { tags: tag._id } }
    );

    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get popular tags (most used)
exports.getPopularTags = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const tags = await Tag.find({ isActive: true })
      .sort({ questionCount: -1 })
      .limit(parseInt(limit))
      .select('name color questionCount');

    res.json({ tags });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search tags by name (for autocomplete)
exports.searchTags = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({ tags: [] });
    }

    const tags = await Tag.find({
      name: { $regex: q.trim(), $options: 'i' },
      isActive: true
    })
      .sort({ questionCount: -1 })
      .limit(parseInt(limit))
      .select('name color questionCount');

    res.json({ tags });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get questions by tag
exports.getQuestionsByTag = async (req, res) => {
  try {
    const { tagName } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;

    const tag = await Tag.findOne({ name: tagName.toLowerCase() });
    if (!tag || !tag.isActive) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;

    const questions = await Question.find({ 
      tags: tag._id, 
      isActive: true 
    })
      .populate('author', 'name email reputation avatar')
      .populate('tags', 'name color')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Question.countDocuments({ 
      tags: tag._id, 
      isActive: true 
    });

    res.json({
      tag,
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
