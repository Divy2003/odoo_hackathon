import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { voteOnContent } from '../../redux/slices/questionsSlice';
import { answersAPI } from '../../services/api';
import { FaArrowUp, FaArrowDown, FaCheck, FaEdit, FaTrash } from 'react-icons/fa';

const AnswerList = ({ answers, questionId, questionAuthorId }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [userVotes, setUserVotes] = useState({});

  const handleVote = async (answerId, voteType) => {
    if (!isAuthenticated) {
      alert('Please login to vote');
      return;
    }

    const result = await dispatch(voteOnContent({
      targetType: 'answer',
      targetId: answerId,
      voteType
    }));

    if (voteOnContent.fulfilled.match(result)) {
      setUserVotes({
        ...userVotes,
        [answerId]: result.payload.userVote
      });
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      await answersAPI.acceptAnswer(answerId);
      // Refresh the page or update state
      window.location.reload();
    } catch (error) {
      console.error('Error accepting answer:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canAcceptAnswer = isAuthenticated && user?.id === questionAuthorId;
  
  const canEditAnswer = (answer) => {
    return isAuthenticated && (user?.id === answer.author?._id || user?.role === 'admin');
  };

  // Sort answers: accepted first, then by votes
  const sortedAnswers = [...answers].sort((a, b) => {
    if (a.isAccepted && !b.isAccepted) return -1;
    if (!a.isAccepted && b.isAccepted) return 1;
    return b.votes - a.votes;
  });

  if (answers.length === 0) {
    return (
      <div className="no-answers">
        <p>No answers yet. Be the first to help!</p>
      </div>
    );
  }

  return (
    <div className="answers-list">
      {sortedAnswers.map((answer) => (
        <div 
          key={answer._id} 
          className={`answer-item ${answer.isAccepted ? 'accepted' : ''}`}
        >
          <div className="answer-vote-section">
            <button
              className={`vote-btn ${userVotes[answer._id] === 'upvote' ? 'active' : ''}`}
              onClick={() => handleVote(answer._id, 'upvote')}
              disabled={!isAuthenticated}
            >
              <FaArrowUp />
            </button>
            <span className="vote-count">{answer.votes}</span>
            <button
              className={`vote-btn ${userVotes[answer._id] === 'downvote' ? 'active' : ''}`}
              onClick={() => handleVote(answer._id, 'downvote')}
              disabled={!isAuthenticated}
            >
              <FaArrowDown />
            </button>
            
            {canAcceptAnswer && !answer.isAccepted && (
              <button
                className="accept-btn"
                onClick={() => handleAcceptAnswer(answer._id)}
                title="Accept this answer"
              >
                <FaCheck />
              </button>
            )}
            
            {answer.isAccepted && (
              <div className="accepted-indicator" title="Accepted answer">
                <FaCheck />
              </div>
            )}
          </div>

          <div className="answer-content">
            {answer.isAccepted && (
              <div className="accepted-badge">
                <FaCheck /> Accepted Answer
              </div>
            )}
            
            <div 
              className="answer-body"
              dangerouslySetInnerHTML={{ __html: answer.content }}
            />

            <div className="answer-footer">
              <div className="answer-actions">
                {canEditAnswer(answer) && (
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

              <div className="answer-author-info">
                <div className="answer-meta">
                  <span>answered {formatDate(answer.createdAt)}</span>
                  {answer.updatedAt !== answer.createdAt && (
                    <span>edited {formatDate(answer.updatedAt)}</span>
                  )}
                </div>
                
                <div className="author-card">
                  <img
                    src={answer.author?.avatar || '/default-avatar.png'}
                    alt={answer.author?.name}
                    className="author-avatar"
                  />
                  <div className="author-details">
                    <div className="author-name">{answer.author?.name}</div>
                    <div className="author-reputation">
                      {answer.author?.reputation || 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnswerList;
