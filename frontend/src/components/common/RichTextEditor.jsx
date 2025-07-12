import { useState, useRef } from 'react';

const RichTextEditor = ({ value, onChange, placeholder = "Write your content here..." }) => {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef(null);

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

  const renderPreview = (text) => {
    if (!text) return '';

    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="rich-text-editor">
      <div className="editor-toolbar">
        <button type="button" onClick={() => handleToolbarAction('bold')} title="Bold (Ctrl+B)">
          <strong>B</strong>
        </button>
        <button type="button" onClick={() => handleToolbarAction('italic')} title="Italic (Ctrl+I)">
          <em>I</em>
        </button>
        <button type="button" onClick={() => handleToolbarAction('heading')} title="Heading">
          H
        </button>
        <button type="button" onClick={() => handleToolbarAction('link')} title="Link">
          🔗
        </button>
        <button type="button" onClick={() => handleToolbarAction('code')} title="Code">
          &lt;/&gt;
        </button>
        <button type="button" onClick={() => handleToolbarAction('list')} title="List">
          • List
        </button>
        <div className="toolbar-divider"></div>
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          title="Toggle Preview"
          className={isPreview ? 'active' : ''}
        >
          {isPreview ? '✏️ Edit' : '👁️ Preview'}
        </button>
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
