import { useState, useEffect } from 'react';
import { tagsAPI } from '../../services/api';
import { FaTimes } from 'react-icons/fa';

const TagInput = ({ tags, onChange, placeholder = "Add tags..." }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchTags = async () => {
      if (inputValue.trim().length > 0) {
        setLoading(true);
        try {
          const response = await tagsAPI.searchTags({ q: inputValue, limit: 5 });
          setSuggestions(response.data.tags);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Error searching tags:', error);
          setSuggestions([]);
        }
        setLoading(false);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(searchTags, 300);
    return () => clearTimeout(debounceTimer);
  }, [inputValue]);

  const addTag = (tagName) => {
    const trimmedTag = tagName.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleSuggestionClick = (tag) => {
    addTag(tag.name);
  };

  return (
    <div className="tag-input-container">
      <div className="tag-input-wrapper">
        <div className="selected-tags">
          {tags.map((tag, index) => (
            <span key={index} className="tag-item">
              {tag}
              <button
                type="button"
                className="remove-tag-btn"
                onClick={() => removeTag(tag)}
              >
                <FaTimes />
              </button>
            </span>
          ))}
        </div>
        
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="tag-input"
        />
      </div>

      {showSuggestions && (
        <div className="tag-suggestions">
          {loading ? (
            <div className="suggestion-loading">Searching...</div>
          ) : suggestions.length > 0 ? (
            suggestions.map((tag) => (
              <button
                key={tag._id}
                type="button"
                className="tag-suggestion"
                onClick={() => handleSuggestionClick(tag)}
              >
                <span className="suggestion-name">{tag.name}</span>
                <span className="suggestion-count">{tag.questionCount} questions</span>
              </button>
            ))
          ) : inputValue.trim() && (
            <button
              type="button"
              className="tag-suggestion create-new"
              onClick={() => addTag(inputValue)}
            >
              Create "{inputValue.trim()}"
            </button>
          )}
        </div>
      )}

      <div className="tag-input-help">
        Press Enter or comma to add tags. Maximum 5 tags allowed.
      </div>
    </div>
  );
};

export default TagInput;
