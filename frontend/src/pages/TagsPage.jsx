import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tagsAPI } from '../services/api';
import { FaSearch } from 'react-icons/fa';

const TagsPage = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('questionCount');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTags: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    fetchTags();
  }, [searchTerm, sortBy, pagination.currentPage]);

  const fetchTags = async () => {
    setLoading(true);
    try {
      const response = await tagsAPI.getTags({
        page: pagination.currentPage,
        limit: 10,
        search: searchTerm,
        sortBy,
        order: 'desc'
      });
      setTags(response.data.tags);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to fetch tags');
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, currentPage: 1 });
    fetchTags();
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handlePageChange = (page) => {
    setPagination({ ...pagination, currentPage: page });
  };

  if (loading && tags.length === 0) {
    return <div className="loading">Loading tags...</div>;
  }

  return (
    <div className="tags-page-container">
      <div className="tags-header">
        <h1>Tags</h1>
        <p>
          A tag is a keyword or label that categorizes your question with other, 
          similar questions. Using the right tags makes it easier for others to 
          find and answer your question.
        </p>
      </div>

      <div className="tags-controls">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        <div className="sort-options">
          <button
            className={`sort-btn ${sortBy === 'questionCount' ? 'active' : ''}`}
            onClick={() => handleSortChange('questionCount')}
          >
            Popular
          </button>
          <button
            className={`sort-btn ${sortBy === 'createdAt' ? 'active' : ''}`}
            onClick={() => handleSortChange('createdAt')}
          >
            Newest
          </button>
          <button
            className={`sort-btn ${sortBy === 'name' ? 'active' : ''}`}
            onClick={() => handleSortChange('name')}
          >
            Name
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {tags.length === 0 && !loading ? (
        <div className="no-tags">
          <p>No tags found.</p>
        </div>
      ) : (
        <div className="tags-grid">
          {tags.map((tag) => (
            <div key={tag._id} className="tag-card">
              <Link 
                to={`/tags/${tag.name}`} 
                className="tag-name"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </Link>
              
              <div className="tag-description">
                {tag.description || 'No description available'}
              </div>
              
              <div className="tag-stats">
                <span className="question-count">
                  {tag.questionCount} question{tag.questionCount !== 1 ? 's' : ''}
                </span>
                {tag.createdBy && (
                  <span className="created-by">
                    Created by {tag.createdBy.name}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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

export default TagsPage;
