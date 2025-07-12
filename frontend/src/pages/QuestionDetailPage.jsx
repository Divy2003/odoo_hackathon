import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchQuestion, fetchAnswers, voteOnContent } from '../redux/slices/questionsSlice';
import { FaArrowUp, FaArrowDown, FaEye, FaCheck, FaEdit, FaTrash } from 'react-icons/fa';
import AnswerForm from '../components/questions/AnswerForm';
import AnswerList from '../components/questions/AnswerList';
import MarkdownRenderer from '../components/common/MarkdownRenderer';
import Avatar from '../components/common/Avatar';

const QuestionDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentQuestion, answers, questionLoading, answersLoading, error } = useSelector(
    (state) => state.questions
  );
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [userVote, setUserVote] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(fetchQuestion(id));
      dispatch(fetchAnswers({ questionId: id }));
    }
  }, [dispatch, id]);

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      alert('Please login to vote');
      return;
    }

    const result = await dispatch(voteOnContent({
      targetType: 'question',
      targetId: id,
      voteType
    }));

    if (voteOnContent.fulfilled.match(result)) {
      setUserVote(result.payload.userVote);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canEdit = isAuthenticated && (
    user?.id === currentQuestion?.author?._id || user?.role === 'admin'
  );

  if (questionLoading) {
    return <div className="loading">Loading question...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!currentQuestion) {
    return <div className="error-message">Question not found</div>;
  }

  return (
    <div className="question-detail-container">
      <div className="question-detail">
        <div className="question-header">
          <h1>{currentQuestion.title}</h1>
          <div className="question-meta-header">
            <span>Asked {formatDate(currentQuestion.createdAt)}</span>
            <span>Viewed {currentQuestion.views} times</span>
            {currentQuestion.lastActivity && (
              <span>Active {formatDate(currentQuestion.lastActivity)}</span>
            )}
          </div>
        </div>

        <div className="question-content-wrapper">
          <div className="vote-section">
            <button
              className={`vote-btn ${userVote === 'upvote' ? 'active' : ''}`}
              onClick={() => handleVote('upvote')}
              disabled={!isAuthenticated}
            >
              <FaArrowUp />
            </button>
            <span className="vote-count">{currentQuestion.votes}</span>
            <button
              className={`vote-btn ${userVote === 'downvote' ? 'active' : ''}`}
              onClick={() => handleVote('downvote')}
              disabled={!isAuthenticated}
            >
              <FaArrowDown />
            </button>
          </div>

          <div className="question-main-content">
            <MarkdownRenderer
              content={currentQuestion.description}
              className="question-body"
            />

            <div className="question-tags">
              {currentQuestion.tags?.map((tag) => (
                <Link
                  key={tag._id}
                  to={`/tags/${tag.name}`}
                  className="tag"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </Link>
              ))}
            </div>

            <div className="question-actions">
              {canEdit && (
                <>
                  <button className="action-btn">
                    <FaEdit /> Edit
                  </button>
                  <button className="action-btn delete">
                    <FaTrash /> Delete
                  </button>
                </>
              )}
            </div>

            <div className="question-author-info">
              <div className="author-card">
                <img
                  src={currentQuestion.author?.avatar || '/default-avatar.png'}
                  alt={currentQuestion.author?.name}
                  className="author-avatar"
                />
                <div className="author-details">
                  <div className="author-name">{currentQuestion.author?.name}</div>
                  <div className="author-reputation">
                    {currentQuestion.author?.reputation || 0} reputation
                  </div>
                  <div className="author-joined">
                    Joined {formatDate(currentQuestion.author?.joinedAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers Section */}
      <div className="answers-section">
        <div className="answers-header">
          <h2>
            {answers.length} Answer{answers.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {answersLoading ? (
          <div className="loading">Loading answers...</div>
        ) : (
          <AnswerList 
            answers={answers} 
            questionId={id}
            questionAuthorId={currentQuestion.author?._id}
          />
        )}

        {/* Answer Form */}
        {isAuthenticated ? (
          <AnswerForm questionId={id} />
        ) : (
          <div className="login-prompt">
            <p>
              <Link to="/login">Login</Link> or <Link to="/signup">Sign up</Link> to post an answer.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetail;
