import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAnswer } from '../../redux/slices/questionsSlice';
import RichTextEditor from '../common/RichTextEditor';

const AnswerForm = ({ questionId }) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.questions);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      setError('Answer content is required');
      return;
    }

    if (content.trim().length < 10) {
      setError('Answer must be at least 10 characters long');
      return;
    }

    const result = await dispatch(createAnswer({ questionId, content }));
    
    if (createAnswer.fulfilled.match(result)) {
      setContent('');
      setError('');
    }
  };

  const handleContentChange = (value) => {
    setContent(value);
    if (error) {
      setError('');
    }
  };

  return (
    <div className="answer-form-container">
      <h3>Your Answer</h3>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="answer-form">
        <div className="form-group">
          <RichTextEditor
            value={content}
            onChange={handleContentChange}
            placeholder="Write your answer here. Be clear and helpful!"
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !content.trim()}
          >
            {loading ? 'Posting...' : 'Post Answer'}
          </button>
        </div>
      </form>

      <div className="answer-guidelines">
        <h4>Guidelines for a good answer:</h4>
        <ul>
          <li>Answer the question directly and completely</li>
          <li>Provide examples or code when helpful</li>
          <li>Explain your reasoning</li>
          <li>Be respectful and constructive</li>
          <li>Format your answer for readability</li>
        </ul>
      </div>
    </div>
  );
};

export default AnswerForm;
