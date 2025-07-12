import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { questionsAPI, tagsAPI } from '../../services/api';
import RichTextEditor from '../common/RichTextEditor';
import TagInput from '../common/TagInput';

const EditQuestion = ({ questionId, onClose, onUpdate }) => {
  console.log("EditQuestion component rendered with questionId:", questionId);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [],
    image: null
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchQuestion();
  }, [questionId]);

  const fetchQuestion = async () => {
    try {
      const response = await questionsAPI.getQuestion(questionId);
      const question = response.data;
      setFormData({
        title: question.title,
        description: question.description,
        tags: question.tags || [],
        image: question.image || null
      });
    } catch (error) {
      console.error('Error fetching question:', error);
    }
    setInitialLoading(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
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
      const response = await questionsAPI.updateQuestion(questionId, formData);
      onUpdate && onUpdate(response.data);
      onClose && onClose();
    } catch (error) {
      setErrors({ submit: error.response?.data?.message || 'Failed to update question' });
    }
    setLoading(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Image size must be less than 5MB' });
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, image: 'Please select a valid image file' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        handleChange('image', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    handleChange('image', null);
  };

  if (initialLoading) {
    return <div className="loading">Loading question...</div>;
  }

  return (
    <div className="edit-question-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Question</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="edit-question-form">
          {errors.submit && (
            <div className="error-message">
              {errors.submit}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="What's your programming question? Be specific."
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <RichTextEditor
              value={formData.description}
              onChange={(value) => handleChange('description', value)}
              placeholder="Provide all the details someone would need to answer your question..."
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label>Image (Optional)</label>
            <div className="image-upload-container">
              {!formData.image ? (
                <div className="image-upload-area">
                  <input
                    type="file"
                    id="image-upload-edit"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="image-upload-edit" className="image-upload-label">
                    <div className="upload-icon">📷</div>
                    <div className="upload-text">
                      <span>Click to upload an image</span>
                      <small>PNG, JPG, GIF up to 5MB</small>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="image-preview">
                  <img src={formData.image} alt="Question preview" />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={removeImage}
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            {errors.image && <span className="error-text">{errors.image}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags *</label>
            <TagInput
              selectedTags={formData.tags}
              onTagsChange={(tags) => handleChange('tags', tags)}
              placeholder="Add tags to describe what your question is about"
            />
            {errors.tags && <span className="error-text">{errors.tags}</span>}
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
              {loading ? 'Updating...' : 'Update Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditQuestion;
