const Notification = require('../models/Notification');
const User = require('../models/User');

// Get user's notifications
exports.getNotifications = async (req, res) => {
  console.log('DEBUG: req.user =', req.user);

  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = {
      recipient: req.user.id,
      isActive: true
    };

    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const skip = (page - 1) * limit;

    const notifications = await Notification.find(query)
      .populate('sender', 'name avatar')
      .populate('relatedQuestion', 'title')
      .populate('relatedAnswer', 'content')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
      isActive: true
    });

    res.json({
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit) || 1,
        totalNotifications: total || 0,
        hasNext: (page * limit) < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Notification error:', error);
    // Return empty notifications instead of error to prevent frontend crashes
    res.json({
      notifications: [],
      unreadCount: 0,
      pagination: {
        currentPage: parseInt(req.query.page || 1),
        totalPages: 1,
        totalNotifications: 0,
        hasNext: false,
        hasPrev: false
      }
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({
      _id: id,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isActive = false;
    await notification.save();

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get unread notification count
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
      isActive: true
    });

    res.json({ unreadCount: count || 0 });
  } catch (error) {
    console.error('Unread count error:', error);
    // Return 0 instead of error to prevent frontend crashes
    res.json({ unreadCount: 0 });
  }
};

// Create notification (internal function, can be used by other controllers)
exports.createNotification = async (notificationData) => {
  try {
    const notification = new Notification(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Send admin message to all users (admin only)
exports.sendAdminMessage = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { title, message, targetUsers } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    let recipients;
    if (targetUsers && targetUsers.length > 0) {
      // Send to specific users
      recipients = targetUsers;
    } else {
      // Send to all active users
      const users = await User.find({ isActive: true }).select('_id');
      recipients = users.map(user => user._id);
    }

    // Create notifications for all recipients
    const notifications = recipients.map(userId => ({
      recipient: userId,
      sender: req.user.id,
      type: 'admin_message',
      title,
      message
    }));

    await Notification.insertMany(notifications);

    res.json({ 
      message: 'Admin message sent successfully',
      recipientCount: recipients.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get notification statistics (admin only)
exports.getNotificationStats = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const totalNotifications = await Notification.countDocuments({ isActive: true });
    const unreadNotifications = await Notification.countDocuments({ 
      isActive: true, 
      isRead: false 
    });

    const notificationsByType = await Notification.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recentActivity = await Notification.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': -1 } },
      { $limit: 7 }
    ]);

    res.json({
      totalNotifications,
      unreadNotifications,
      readRate: totalNotifications > 0 ? 
        ((totalNotifications - unreadNotifications) / totalNotifications * 100).toFixed(2) : 0,
      notificationsByType,
      recentActivity
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
