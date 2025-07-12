import { useState, useEffect } from 'react';
import { answersAPI } from '../../services/api';
import RichTextEditor from '../common/RichTextEditor';

const EditAnswer = ({ answerId, initialContent, onClose, onUpdate }) => {
  const [content, setContent] = useState(initialContent || '');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!content.trim()) {
      newErrors.content = 'Answer content is required';
    } else if (content.trim().length < 20) {
      newErrors.content = 'Answer must be at least 20 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await answersAPI.updateAnswer(answerId, { content });
      onUpdate && onUpdate(response.data);
      onClose && onClose();
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Failed to update answer' });
    }
    setLoading(false);
  };

  const handleChange = (value) => {
    setContent(value);
    
    // Clear error
    if (errors.content) {
      setErrors(prev => ({
        ...prev,
        content: ''
      }));
    }
  };

  return (
    <div className="edit-answer-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Answer</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-answer-form">
          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="content">Your Answer *</label>
            <RichTextEditor
              value={content}
              onChange={handleChange}
              placeholder="Write your updated answer here..."
            />
            {errors.content && <span className="error-text">{errors.content}</span>}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Answer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAnswer;
