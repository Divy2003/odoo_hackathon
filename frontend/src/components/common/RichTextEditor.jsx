import { useState, useRef } from 'react';
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaStrikethrough,
  FaListUl,
  FaListOl,
  FaLink,
  FaImage,
  FaCode,
  FaSmile,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaEye,
  FaEdit
} from 'react-icons/fa';

const RichTextEditor = ({ value, onChange, placeholder = "Write your content here..." }) => {
  const [isPreview, setIsPreview] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const commonEmojis = ['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💯', '🎉', '👏', '🙏'];

  const handleToolbarAction = (action) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    let newText = value;
    let cursorPos = end;

    switch (action) {
      case 'bold':
        if (selectedText) {
          newText = value.substring(0, start) + `**${selectedText}**` + value.substring(end);
          cursorPos = end + 4;
        } else {
          newText = value.substring(0, start) + '**bold text**' + value.substring(end);
          cursorPos = start + 2;
        }
        break;
      case 'italic':
        if (selectedText) {
          newText = value.substring(0, start) + `*${selectedText}*` + value.substring(end);
          cursorPos = end + 2;
        } else {
          newText = value.substring(0, start) + '*italic text*' + value.substring(end);
          cursorPos = start + 1;
        }
        break;
      case 'strikethrough':
        if (selectedText) {
          newText = value.substring(0, start) + `~~${selectedText}~~` + value.substring(end);
          cursorPos = end + 4;
        } else {
          newText = value.substring(0, start) + '~~strikethrough text~~' + value.substring(end);
          cursorPos = start + 2;
        }
        break;
      case 'underline':
        if (selectedText) {
          newText = value.substring(0, start) + `<u>${selectedText}</u>` + value.substring(end);
          cursorPos = end + 7;
        } else {
          newText = value.substring(0, start) + '*italic text*' + value.substring(end);
          cursorPos = start + 1;
        }
        break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) {
          const linkText = selectedText || 'link text';
          newText = value.substring(0, start) + `[${linkText}](${url})` + value.substring(end);
          cursorPos = end + url.length + 4;
        }
        break;
      case 'code':
        if (selectedText) {
          newText = value.substring(0, start) + `\`${selectedText}\`` + value.substring(end);
          cursorPos = end + 2;
        } else {
          newText = value.substring(0, start) + '`code`' + value.substring(end);
          cursorPos = start + 1;
        }
        break;
      case 'list':
        const lines = value.split('\n');
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        newText = value.substring(0, lineStart) + '- ' + value.substring(lineStart);
        cursorPos = start + 2;
        break;
      case 'heading':
        const headingLines = value.split('\n');
        const headingLineStart = value.lastIndexOf('\n', start - 1) + 1;
        newText = value.substring(0, headingLineStart) + '## ' + value.substring(headingLineStart);
        cursorPos = start + 3;
        break;
      case 'numberedList':
        const numLineStart = value.lastIndexOf('\n', start - 1) + 1;
        newText = value.substring(0, numLineStart) + '1. ' + value.substring(numLineStart);
        cursorPos = start + 3;
        break;
      case 'alignLeft':
        const leftLineStart = value.lastIndexOf('\n', start - 1) + 1;
        const leftLineEnd = value.indexOf('\n', start);
        const leftLine = value.substring(leftLineStart, leftLineEnd === -1 ? value.length : leftLineEnd);
        newText = value.substring(0, leftLineStart) + '<div style="text-align: left">' + leftLine + '</div>' + value.substring(leftLineEnd === -1 ? value.length : leftLineEnd);
        cursorPos = start + 30;
        break;
      case 'alignCenter':
        const centerLineStart = value.lastIndexOf('\n', start - 1) + 1;
        const centerLineEnd = value.indexOf('\n', start);
        const centerLine = value.substring(centerLineStart, centerLineEnd === -1 ? value.length : centerLineEnd);
        newText = value.substring(0, centerLineStart) + '<div style="text-align: center">' + centerLine + '</div>' + value.substring(centerLineEnd === -1 ? value.length : centerLineEnd);
        cursorPos = start + 32;
        break;
      case 'alignRight':
        const rightLineStart = value.lastIndexOf('\n', start - 1) + 1;
        const rightLineEnd = value.indexOf('\n', start);
        const rightLine = value.substring(rightLineStart, rightLineEnd === -1 ? value.length : rightLineEnd);
        newText = value.substring(0, rightLineStart) + '<div style="text-align: right">' + rightLine + '</div>' + value.substring(rightLineEnd === -1 ? value.length : rightLineEnd);
        cursorPos = start + 31;
        break;
      default:
        break;
    }

    onChange(newText);

    // Set cursor position after update
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(cursorPos, cursorPos);
      }
    }, 0);
  };

  const handleEmojiSelect = (emoji) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = value.substring(0, start) + emoji + value.substring(end);

    onChange(newText);
    setShowEmojiPicker(false);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const imageMarkdown = `![Image](${e.target.result})`;
        const newText = value.substring(0, start) + imageMarkdown + value.substring(end);

        onChange(newText);

        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
        }, 0);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderPreview = (text) => {
    if (!text) return '';

    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width: 100%; height: auto;" />')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      .replace(/<div style="text-align: (left|center|right)">(.*?)<\/div>/g, '<div style="text-align: $1">$2</div>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        {/* Text Formatting */}
        <div className="toolbar-group">
          <button type="button" onClick={() => handleToolbarAction('bold')} title="Bold">
            <FaBold />
          </button>
          <button type="button" onClick={() => handleToolbarAction('italic')} title="Italic">
            <FaItalic />
          </button>
          <button type="button" onClick={() => handleToolbarAction('underline')} title="Underline">
            <FaUnderline />
          </button>
          <button type="button" onClick={() => handleToolbarAction('strikethrough')} title="Strikethrough">
            <FaStrikethrough />
          </button>
        </div>

        <div className="toolbar-divider"></div>

        {/* Lists */}
        <div className="toolbar-group">
          <button type="button" onClick={() => handleToolbarAction('list')} title="Bullet List">
            <FaListUl />
          </button>
          <button type="button" onClick={() => handleToolbarAction('numberedList')} title="Numbered List">
            <FaListOl />
          </button>
        </div>

        <div className="toolbar-divider"></div>

        {/* Alignment */}
        <div className="toolbar-group">
          <button type="button" onClick={() => handleToolbarAction('alignLeft')} title="Align Left">
            <FaAlignLeft />
          </button>
          <button type="button" onClick={() => handleToolbarAction('alignCenter')} title="Align Center">
            <FaAlignCenter />
          </button>
          <button type="button" onClick={() => handleToolbarAction('alignRight')} title="Align Right">
            <FaAlignRight />
          </button>
        </div>

        <div className="toolbar-divider"></div>

        {/* Media & Links */}
        <div className="toolbar-group">
          <button type="button" onClick={() => handleToolbarAction('link')} title="Insert Link">
            <FaLink />
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()} title="Upload Image">
            <FaImage />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          <div className="emoji-picker-container">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Insert Emoji"
            >
              <FaSmile />
            </button>
            {showEmojiPicker && (
              <div className="emoji-picker">
                {commonEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleEmojiSelect(emoji)}
                    className="emoji-btn"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="toolbar-divider"></div>

        {/* Code & Preview */}
        <div className="toolbar-group">
          <button type="button" onClick={() => handleToolbarAction('code')} title="Inline Code">
            <FaCode />
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(!isPreview)}
            title="Toggle Preview"
            className={isPreview ? 'active' : ''}
          >
            {isPreview ? <FaEdit /> : <FaEye />}
          </button>
        </div>
      </div>

      {!isPreview ? (
        <textarea
          ref={textareaRef}
          className="rich-editor-textarea"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={12}
          onKeyDown={(e) => {
            if (e.ctrlKey || e.metaKey) {
              if (e.key === 'b') {
                e.preventDefault();
                handleToolbarAction('bold');
              } else if (e.key === 'i') {
                e.preventDefault();
                handleToolbarAction('italic');
              }
            }
          }}
        />
      ) : (
        <div
          className="editor-preview"
          dangerouslySetInnerHTML={{ __html: renderPreview(value || '') }}
        />
      )}

      <div className="editor-help">
        <p><strong>Shortcuts:</strong> Ctrl+B (bold), Ctrl+I (italic) | <strong>Markdown:</strong> **bold**, *italic*, [links](url), `code`, ## heading, - lists</p>
      </div>
    </div>
  );
};

export default RichTextEditor;
