import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchQuestions, setFilters } from '../redux/slices/questionsSlice';
import { FaEye, FaArrowUp, FaArrowDown, FaCheck } from 'react-icons/fa';

const Home = () => {
  const dispatch = useDispatch();
  const { questions, loading, pagination, filters } = useSelector((state) => state.questions);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchQuestions(filters));
  }, [dispatch, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(setFilters({ search: searchTerm, page: 1 }));
  };

  const handleSortChange = (sortBy) => {
    dispatch(setFilters({ sortBy, page: 1 }));
  };

  const handlePageChange = (page) => {
    dispatch(setFilters({ page }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  if (loading) {
    return (
      <div className="loading">
        Loading questions...
      </div>
    );
  }

  return (
    <div className="posts-container">
      <div className="posts-header">
        <h1>All Questions</h1>
        <Link to="/ask" className="btn btn-primary">
          Ask Question
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="search-filters">
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="btn btn-outline">
            Search
          </button>
        </form>

        <div className="sort-options">
          <button
            className={`sort-btn ${filters.sortBy === 'createdAt' ? 'active' : ''}`}
            onClick={() => handleSortChange('createdAt')}
          >
            Newest
          </button>
          <button
            className={`sort-btn ${filters.sortBy === 'votes' ? 'active' : ''}`}
            onClick={() => handleSortChange('votes')}
          >
            Most Voted
          </button>
          <button
            className={`sort-btn ${filters.sortBy === 'views' ? 'active' : ''}`}
            onClick={() => handleSortChange('views')}
          >
            Most Viewed
          </button>
          <button
            className={`sort-btn ${filters.sortBy === 'lastActivity' ? 'active' : ''}`}
            onClick={() => handleSortChange('lastActivity')}
          >
            Active
          </button>
        </div>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="no-posts">
          <p>No questions found.</p>
          <Link to="/ask" className="btn btn-primary">
            Ask the first question
          </Link>
        </div>
      ) : (
        <div className="questions-list">
          {questions.map((question) => (
            <div key={question._id} className="question-card">
              <div className="question-stats">
                <div className="stat">
                  <span className="stat-number">{question.votes}</span>
                  <span className="stat-label">votes</span>
                </div>
                <div className={`stat ${question.acceptedAnswer ? 'accepted' : ''}`}>
                  <span className="stat-number">{question.answers?.length || 0}</span>
                  <span className="stat-label">answers</span>
                  {question.acceptedAnswer && <FaCheck className="accepted-icon" />}
                </div>
                <div className="stat">
                  <span className="stat-number">{question.views}</span>
                  <span className="stat-label">views</span>
                </div>
              </div>

              <div className="question-content">
                <h3 className="question-title">
                  <Link to={`/questions/${question._id}`}>
                    {question.title}
                  </Link>
                </h3>
                
                <div className="question-excerpt">
                  {question.description.length > 200
                    ? `${question.description.substring(0, 200)}...`
                    : question.description}
                </div>

                <div className="question-tags">
                  {question.tags?.map((tag) => (
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

                <div className="question-meta">
                  <div className="question-author">
                    <img
                      src={question.author?.avatar || '/default-avatar.png'}
                      alt={question.author?.name}
                      className="author-avatar"
                    />
                    <span className="author-name">{question.author?.name}</span>
                    <span className="author-reputation">
                      {question.author?.reputation || 0}
                    </span>
                  </div>
                  <div className="question-time">
                    asked {formatTimeAgo(question.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-outline"
            disabled={!pagination.hasPrev}
            onClick={() => handlePageChange(pagination.currentPage - 1)}
          >
            Previous
          </button>
          
          <span className="pagination-info">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          
          <button
            className="btn btn-outline"
            disabled={!pagination.hasNext}
            onClick={() => handlePageChange(pagination.currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
