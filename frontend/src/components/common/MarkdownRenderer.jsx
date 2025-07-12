const MarkdownRenderer = ({ content, className = '' }) => {
  const renderMarkdown = (text) => {
    if (!text) return '';
    
    return text
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      
      // Bold and Italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Code blocks (triple backticks)
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      
      // Inline code
      .replace(/`(.*?)`/g, '<code>$1</code>')
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // Lists
      .replace(/^\* (.*$)/gm, '<li>$1</li>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/^\+ (.*$)/gm, '<li>$1</li>')
      
      // Line breaks
      .replace(/\n/g, '<br>');
  };

  // Wrap list items in ul tags
  const processLists = (html) => {
    return html.replace(/(<li>.*<\/li>)/g, (match) => {
      if (!match.includes('<ul>')) {
        return `<ul>${match}</ul>`;
      }
      return match;
    });
  };

  const processedContent = processLists(renderMarkdown(content));

  return (
    <div 
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  );
};

export default MarkdownRenderer;
