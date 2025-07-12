import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getProfile } from '../redux/slices/authSlice';
import { questionsAPI, answersAPI, votesAPI } from '../services/api';
import { FaUser, FaQuestion, FaComment, FaThumbsUp, FaCalendar, FaEdit } from 'react-icons/fa';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState({
    questionsCount: 0,
    answersCount: 0,
    votesCount: 0,
    recentQuestions: [],
    recentAnswers: []
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user?.id) {
      fetchUserStats();
    }
  }, [user?.id]);

  const fetchUserStats = async () => {
    if (!user?.id) return;
    
    setStatsLoading(true);
    try {
      // Fetch user's questions
      const questionsResponse = await questionsAPI.getQuestions({
        author: user._id,
        limit: 5
      });
      console.log("questionsResponse-",questionsResponse);
      
      // Fetch user's votes
      const votesResponse = await votesAPI.getUserVotes({ limit: 5 });
      console.log("votesResponse-",votesResponse);
      
      setUserStats({
        questionsCount: questionsResponse.data.pagination.totalQuestions,
        recentQuestions: questionsResponse.data.questions,
        votesCount: votesResponse.data.pagination.totalVotes,
        // Note: We'd need to implement user answers endpoint
        answersCount: 0,
        recentAnswers: []
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
    setStatsLoading(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!user) {
    return <div className="error-message">User not found</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="avatar-large"
            />
          ) : (
            <div className="avatar-large avatar-initials">
              {getInitials(user.name)}
            </div>
          )}
        </div>

        <div className="profile-info">
          <div className="profile-title">
            <h1>{user.name}</h1>
            <Link to="/profile/edit" className="btn btn-outline">
              <FaEdit /> Edit Profile
            </Link>
          </div>
          <div className="profile-meta">
            <div className="meta-item">
              <FaUser />
              <span>{user.role}</span>
            </div>
            <div className="meta-item">
              <FaCalendar />
              <span>Joined {formatDate(user.joinedAt)}</span>
            </div>
            <div className="meta-item">
              <span className="reputation">{user.reputation} reputation</span>
            </div>
          </div>
          
          {user.bio && (
            <div className="profile-bio">
              {user.bio}
            </div>
          )}
        </div>
      </div>

      <div className="profile-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          Questions
        </button>
        <button
          className={`tab-btn ${activeTab === 'answers' ? 'active' : ''}`}
          onClick={() => setActiveTab('answers')}
        >
          Answers
        </button>
        <button
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Activity
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <FaQuestion className="stat-icon" />
                <div className="stat-number">{userStats.questionsCount}</div>
                <div className="stat-label">Questions</div>
              </div>
              <div className="stat-card">
                <FaComment className="stat-icon" />
                <div className="stat-number">{userStats.answersCount}</div>
                <div className="stat-label">Answers</div>
              </div>
              <div className="stat-card">
                <FaThumbsUp className="stat-icon" />
                <div className="stat-number">{userStats.votesCount}</div>
                <div className="stat-label">Votes Cast</div>
              </div>
            </div>

            {userStats.recentQuestions.length > 0 && (
              <div className="recent-activity">
                <h3>Recent Questions</h3>
                <div className="activity-list">
                  {userStats.recentQuestions.map((question) => (
                    <div key={question._id} className="activity-item">
                      <div className="activity-content">
                        <h4>
                          <a href={`/questions/${question._id}`}>
                            {question.title}
                          </a>
                        </h4>
                        <div className="activity-meta">
                          <span>{question.votes} votes</span>
                          <span>{question.answers?.length || 0} answers</span>
                          <span>{question.views} views</span>
                          <span>{formatDate(question.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="questions-tab">
            <h3>All Questions ({userStats.questionsCount})</h3>
            {statsLoading ? (
              <div className="loading">Loading questions...</div>
            ) : userStats.recentQuestions.length > 0 ? (
              <div className="questions-list">
                {userStats.recentQuestions.map((question) => (
                  <div key={question._id} className="question-item">
                    <div className="question-stats">
                      <div className="stat">
                        <span className="stat-number">{question.votes}</span>
                        <span className="stat-label">votes</span>
                      </div>
                      <div className="stat">
                        <span className="stat-number">{question.answers?.length || 0}</span>
                        <span className="stat-label">answers</span>
                      </div>
                    </div>
                    <div className="question-content">
                      <h4>
                        <a href={`/questions/${question._id}`}>
                          {question.title}
                        </a>
                      </h4>
                      <div className="question-tags">
                        {question.tags?.map((tag) => (
                          <span key={tag._id} className="tag" style={{ backgroundColor: tag.color }}>
                            {tag.name}
                          </span>
                        ))}
                      </div>
                      <div className="question-date">
                        {formatDate(question.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-content">
                <p>No questions yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'answers' && (
          <div className="answers-tab">
            <h3>All Answers ({userStats.answersCount})</h3>
            <div className="no-content">
              <p>No answers yet.</p>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="activity-tab">
            <h3>Recent Activity</h3>
            <div className="no-content">
              <p>No recent activity.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
