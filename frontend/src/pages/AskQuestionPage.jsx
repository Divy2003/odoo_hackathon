import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createQuestion } from '../redux/slices/questionsSlice';
import RichTextEditor from '../components/common/RichTextEditor';
import TagInput from '../components/common/TagInput';

const AskQuestion = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [],
    image: null
  });
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.questions);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 10 characters';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    } else if (formData.tags.length > 5) {
      newErrors.tags = 'Maximum 5 tags allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log("Submitting form data:", formData);
    const result = await dispatch(createQuestion(formData));
    
    if (createQuestion.fulfilled.match(result)) {
      navigate(`/questions/${result.payload._id}`);
    }
  };

  const handleTitleChange = (e) => {
    setFormData({ ...formData, title: e.target.value });
    if (errors.title) {
      setErrors({ ...errors, title: '' });
    }
  };

  const handleDescriptionChange = (value) => {
    setFormData({ ...formData, description: value });
    if (errors.description) {
      setErrors({ ...errors, description: '' });
    }
  };

  const handleTagsChange = (tags) => {
    setFormData({ ...formData, tags });
    if (errors.tags) {
      setErrors({ ...errors, tags: '' });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'Image size must be less than 5MB' });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, image: 'Please select a valid image file' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        console.log("Image loaded, size:", e.target.result.length);
        setFormData({ ...formData, image: e.target.result });
        if (errors.image) {
          setErrors({ ...errors, image: '' });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, image: null });
  };

  return (
    <div className="ask-question-container">
      <div className="ask-question-header">
        <h1>Ask a Question</h1>
        <p>Get help from the community by asking a clear, detailed question.</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="ask-question-form">
        <div className="form-group">
          <label htmlFor="title">
            Title *
            <span className="form-help">
              Be specific and imagine you're asking a question to another person
            </span>
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="e.g., How do I implement authentication in React?"
            className={errors.title ? 'error' : ''}
          />
          {errors.title && <span className="error-text">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label>
            Description *
            <span className="form-help">
              Include all the information someone would need to answer your question
            </span>
          </label>
          <RichTextEditor
            value={formData.description}
            onChange={handleDescriptionChange}
            placeholder="Provide details about your question. Include what you've tried, what you expected to happen, and what actually happened."
          />
          {errors.description && <span className="error-text">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label>
            Image (Optional)
            <span className="form-help">
              Add an image to help illustrate your question (max 5MB)
            </span>
          </label>
          <div className="image-upload-container">
            {!formData.image ? (
              <div className="image-upload-area">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <label htmlFor="image-upload" className="image-upload-label">
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
          <label>
            Tags *
            <span className="form-help">
              Add up to 5 tags to describe what your question is about
            </span>
          </label>
          <TagInput
            tags={formData.tags}
            onChange={handleTagsChange}
            placeholder="e.g., react, javascript, authentication"
          />
          {errors.tags && <span className="error-text">{errors.tags}</span>}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Publishing...' : 'Publish Question'}
          </button>
        </div>
      </form>

      <div className="ask-question-tips">
        <h3>Tips for asking a good question:</h3>
        <ul>
          <li>Make your title specific and descriptive</li>
          <li>Explain the problem clearly in the description</li>
          <li>Include relevant code, error messages, or examples</li>
          <li>Add appropriate tags to help others find your question</li>
          <li>Be respectful and follow community guidelines</li>
        </ul>
      </div>
    </div>
  );
};

export default AskQuestion;
