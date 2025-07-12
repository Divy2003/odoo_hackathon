import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaBell, FaTimes, FaCheck, FaTrash } from 'react-icons/fa';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from '../../redux/slices/notificationSlice';
import Avatar from '../common/Avatar';

const NotificationDropdown = () => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { notifications, unreadCount, loading, error } = useSelector((state) => state.notifications);

  useEffect(() => {
    if (isAuthenticated) {
      console.log("Fetching unread count for authenticated user");
      dispatch(fetchUnreadCount());
      // Set up polling for new notifications
      const interval = setInterval(() => {
        dispatch(fetchUnreadCount());
      }, 30000); // Check every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleDropdown = () => {
    if (!isOpen) {
      console.log("Fetching notifications...");
      dispatch(fetchNotifications({ limit: 10 }));
    }
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = (notificationId) => {
    dispatch(markAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  const handleDeleteNotification = (notificationId) => {
    dispatch(deleteNotification(notificationId));
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getNotificationLink = (notification) => {
    if (notification.relatedQuestion) {
      return `/questions/${notification.relatedQuestion._id}`;
    }
    return '#';
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="notification-dropdown" ref={dropdownRef}>
      <button 
        className="notification-btn"
        onClick={handleToggleDropdown}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown-content">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
              >
                <FaCheck /> Mark all as read
              </button>
            )}
          </div>

          <div className="notification-list">
            {error && (
              <div className="notification-error">{error}</div>
            )}
            {loading ? (
              <div className="notification-loading">Loading...</div>
            ) : notifications.length === 0 && !error ? (
              <div className="no-notifications">
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                >
                  {notification.sender && (
                    <div className="notification-avatar">
                      <Avatar
                        src={notification.sender.avatar}
                        name={notification.sender.name}
                        size="small"
                      />
                    </div>
                  )}
                  <div className="notification-content">
                    <div className="notification-title">
                      {notification.title}
                    </div>
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-meta">
                      <span className="notification-time">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                      {notification.sender && (
                        <span className="notification-sender">
                          by {notification.sender.name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="notification-actions">
                    {!notification.isRead && (
                      <button
                        className="action-btn"
                        onClick={() => handleMarkAsRead(notification._id)}
                        title="Mark as read"
                      >
                        <FaCheck />
                      </button>
                    )}
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteNotification(notification._id)}
                      title="Delete notification"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  {notification.relatedQuestion && (
                    <a 
                      href={getNotificationLink(notification)}
                      className="notification-link"
                      onClick={() => setIsOpen(false)}
                    >
                      View Question
                    </a>
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <a href="/notifications" onClick={() => setIsOpen(false)}>
                View all notifications
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
