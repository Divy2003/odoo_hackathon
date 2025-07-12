import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getProfile } from '../redux/slices/authSlice';
import { questionsAPI, answersAPI, votesAPI } from '../services/api';
import { FaUser, FaQuestion, FaComment, FaThumbsUp, FaCalendar, FaEdit } from 'react-icons/fa';
import Avatar from '../components/common/Avatar';
import EditQuestion from '../components/questions/EditQuestion';
import EditAnswer from '../components/questions/EditAnswer';

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
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editingAnswer, setEditingAnswer] = useState(null);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user?.id || user?._id) {
      fetchUserStats();
    }
  }, [user?.id, user?._id]);

  const fetchUserStats = async () => {
    const userId = user?._id || user?.id;
    if (!userId) {
      console.log("No user ID found:", user);
      return;
    }

    setStatsLoading(true);
    try {
      console.log("Fetching stats for user:", userId);
      // Fetch user's questions
      const questionsResponse = await questionsAPI.getQuestions({
        author: userId,
        limit: 5
      });
      console.log("questionsResponse-",questionsResponse);
      
      // Fetch user's answers
      const answersResponse = await answersAPI.getUserAnswers({ limit: 5 });
      console.log("answersResponse-", answersResponse);

      // Fetch user's votes
      const votesResponse = await votesAPI.getUserVotes({ limit: 5 });
      console.log("votesResponse-",votesResponse);

      setUserStats({
        questionsCount: questionsResponse.data.pagination.totalQuestions,
        recentQuestions: questionsResponse.data.questions,
        answersCount: answersResponse.data.pagination.totalAnswers,
        recentAnswers: answersResponse.data.answers,
        votesCount: votesResponse.data.pagination.totalVotes,
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
                      <div className="question-header">
                        <h4>
                          <a href={`/questions/${question._id}`}>
                            {question.title}
                          </a>
                        </h4>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => {
                            console.log("Edit question clicked:", question);
                            setEditingQuestion(question);
                          }}
                          title="Edit Question"
                        >
                          <FaEdit />
                        </button>
                      </div>
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
            {statsLoading ? (
              <div className="loading">Loading answers...</div>
            ) : userStats.recentAnswers.length > 0 ? (
              <div className="answers-list">
                {userStats.recentAnswers.map((answer) => (
                  <div key={answer._id} className="answer-item">
                    <div className="answer-content">
                      <div className="answer-header">
                        <h4>
                          <a href={`/questions/${answer.question._id}`}>
                            Answer to: {answer.question.title}
                          </a>
                        </h4>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => setEditingAnswer(answer)}
                          title="Edit Answer"
                        >
                          <FaEdit />
                        </button>
                      </div>
                      <div className="answer-preview">
                        {answer.content.length > 200
                          ? `${answer.content.substring(0, 200)}...`
                          : answer.content}
                      </div>
                      <div className="answer-meta">
                        <span>{answer.votes} votes</span>
                        <span>{formatDate(answer.createdAt)}</span>
                        {answer.isAccepted && <span className="accepted">✓ Accepted</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-content">
                <p>No answers yet.</p>
              </div>
            )}
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

      {/* Edit Modals */}
      {editingQuestion && (
        <EditQuestion
          questionId={editingQuestion._id}
          onClose={() => setEditingQuestion(null)}
          onUpdate={(updatedQuestion) => {
            // Update the question in the local state
            setUserStats(prev => ({
              ...prev,
              recentQuestions: prev.recentQuestions.map(q =>
                q._id === updatedQuestion._id ? updatedQuestion : q
              )
            }));
            setEditingQuestion(null);
          }}
        />
      )}

      {editingAnswer && (
        <EditAnswer
          answerId={editingAnswer._id}
          initialContent={editingAnswer.content}
          onClose={() => setEditingAnswer(null)}
          onUpdate={(updatedAnswer) => {
            // Update the answer in the local state
            setUserStats(prev => ({
              ...prev,
              recentAnswers: prev.recentAnswers.map(a =>
                a._id === updatedAnswer._id ? updatedAnswer : a
              )
            }));
            setEditingAnswer(null);
          }}
        />
      )}
    </div>
  );
};

export default Profile;
