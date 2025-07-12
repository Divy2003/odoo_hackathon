import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { questionsAPI, usersAPI, notificationsAPI } from '../services/api';
import { 
  FaUsers, 
  FaQuestionCircle, 
  FaFlag, 
  FaBan, 
  FaDownload,
  FaBullhorn,
  FaChartBar
} from 'react-icons/fa';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    pendingReports: 0,
    bannedUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [reportedContent, setReportedContent] = useState([]);
  const [users, setUsers] = useState([]);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch statistics
      const [questionsRes, usersRes] = await Promise.all([
        questionsAPI.getQuestions({ limit: 1 }),
        usersAPI.getAllUsers({ limit: 1 })
      ]);

      setStats({
        totalUsers: usersRes.data.pagination?.totalUsers || 0,
        totalQuestions: questionsRes.data.pagination?.totalQuestions || 0,
        pendingReports: 0, // Would need to implement reports system
        bannedUsers: 0 // Would need to implement user banning
      });

      // Fetch users for management
      const allUsersRes = await usersAPI.getAllUsers({ limit: 50 });
      setUsers(allUsersRes.data.users || []);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
    setLoading(false);
  };

  const handleBanUser = async (userId) => {
    try {
      await usersAPI.banUser(userId);
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Failed to ban user');
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await usersAPI.unbanUser(userId);
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error('Error unbanning user:', error);
      alert('Failed to unban user');
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    setSendingBroadcast(true);
    try {
      await notificationsAPI.sendBroadcast({
        message: broadcastMessage,
        type: 'platform_announcement'
      });
      setBroadcastMessage('');
      alert('Broadcast message sent successfully!');
    } catch (error) {
      console.error('Error sending broadcast:', error);
      alert('Failed to send broadcast message');
    }
    setSendingBroadcast(false);
  };

  const downloadReport = (type) => {
    // This would generate and download reports
    alert(`Downloading ${type} report...`);
  };

  if (user?.role !== 'admin') {
    return (
      <div className="admin-container">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage users, content, and platform settings</p>
      </div>

      {/* Stats Overview */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div className="stat-info">
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaQuestionCircle />
          </div>
          <div className="stat-info">
            <div className="stat-number">{stats.totalQuestions}</div>
            <div className="stat-label">Total Questions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaFlag />
          </div>
          <div className="stat-info">
            <div className="stat-number">{stats.pendingReports}</div>
            <div className="stat-label">Pending Reports</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FaBan />
          </div>
          <div className="stat-info">
            <div className="stat-number">{stats.bannedUsers}</div>
            <div className="stat-label">Banned Users</div>
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <FaChartBar /> Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <FaUsers /> User Management
        </button>
        <button 
          className={`tab-btn ${activeTab === 'broadcast' ? 'active' : ''}`}
          onClick={() => setActiveTab('broadcast')}
        >
          <FaBullhorn /> Broadcast Message
        </button>
        <button 
          className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          <FaDownload /> Reports
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <h3>Platform Overview</h3>
            <p>Welcome to the admin dashboard. Use the tabs above to manage different aspects of the platform.</p>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-tab">
            <h3>User Management</h3>
            <div className="users-list">
              {users.map(user => (
                <div key={user._id} className="user-item">
                  <div className="user-info">
                    <div className="user-name">{user.name}</div>
                    <div className="user-email">{user.email}</div>
                    <div className="user-meta">
                      <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                      <span>Role: {user.role}</span>
                      <span>Status: {user.isBanned ? 'Banned' : 'Active'}</span>
                    </div>
                  </div>
                  <div className="user-actions">
                    {user.isBanned ? (
                      <button 
                        className="btn btn-success"
                        onClick={() => handleUnbanUser(user._id)}
                      >
                        Unban
                      </button>
                    ) : (
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleBanUser(user._id)}
                        disabled={user.role === 'admin'}
                      >
                        Ban User
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'broadcast' && (
          <div className="broadcast-tab">
            <h3>Send Platform-wide Message</h3>
            <div className="broadcast-form">
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Enter your platform-wide announcement..."
                rows={6}
              />
              <button 
                className="btn btn-primary"
                onClick={handleSendBroadcast}
                disabled={sendingBroadcast || !broadcastMessage.trim()}
              >
                {sendingBroadcast ? 'Sending...' : 'Send Broadcast'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-tab">
            <h3>Download Reports</h3>
            <div className="reports-grid">
              <div className="report-card">
                <h4>User Activity Report</h4>
                <p>Download detailed user activity and engagement statistics</p>
                <button 
                  className="btn btn-outline"
                  onClick={() => downloadReport('user-activity')}
                >
                  <FaDownload /> Download
                </button>
              </div>
              <div className="report-card">
                <h4>Content Statistics</h4>
                <p>Download questions, answers, and content moderation stats</p>
                <button 
                  className="btn btn-outline"
                  onClick={() => downloadReport('content-stats')}
                >
                  <FaDownload /> Download
                </button>
              </div>
              <div className="report-card">
                <h4>Platform Analytics</h4>
                <p>Download comprehensive platform usage and growth metrics</p>
                <button 
                  className="btn btn-outline"
                  onClick={() => downloadReport('platform-analytics')}
                >
                  <FaDownload /> Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
