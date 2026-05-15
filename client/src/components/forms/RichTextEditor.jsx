import React, { useState, useRef, useEffect } from 'react';
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikethroughIcon,
  ListBulletIcon,
  ListNumberedIcon,
  LinkIcon,
  PhotoIcon,
  CodeBracketIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';

const RichTextEditor = ({ 
  label,
  value = '',
  onChange,
  error,
  required,
  placeholder = 'Write something...',
  height = 200,
  className = '',
  disabled = false,
  helperText
}) => {
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertLink = () => {
    if (linkUrl) {
      const selectedText = window.getSelection().toString();
      const textToInsert = linkText || selectedText || linkUrl;
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${textToInsert}</a>`;
      document.execCommand('insertHTML', false, linkHtml);
      setShowLinkModal(false);
      setLinkUrl('');
      setLinkText('');
      handleInput();
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:', 'https://');
    if (url) {
      execCommand('insertImage', url);
    }
  };

  const clearFormatting = () => {
    document.execCommand('removeFormat', false, null);
    handleInput();
  };

  const toolbarButtons = [
    { icon: BoldIcon, command: 'bold', title: 'Bold' },
    { icon: ItalicIcon, command: 'italic', title: 'Italic' },
    { icon: UnderlineIcon, command: 'underline', title: 'Underline' },
    { icon: StrikethroughIcon, command: 'strikeThrough', title: 'Strikethrough' },
    { divider: true },
    { icon: ListBulletIcon, command: 'insertUnorderedList', title: 'Bullet List' },
    { icon: ListNumberedIcon, command: 'insertOrderedList', title: 'Numbered List' },
    { divider: true },
    { icon: LinkIcon, command: 'link', title: 'Insert Link', action: () => setShowLinkModal(true) },
    { icon: PhotoIcon, command: 'image', title: 'Insert Image', action: insertImage },
    { divider: true },
    { icon: CodeBracketIcon, command: 'formatBlock', value: 'pre', title: 'Code Block' },
    { icon: ArrowPathIcon, command: 'undo', title: 'Undo' },
    { icon: DocumentDuplicateIcon, command: 'redo', title: 'Redo' },
    { divider: true },
    { icon: () => <span className="text-xs">Clear</span>, command: 'removeFormat', title: 'Clear Formatting', action: clearFormatting },
  ];

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={`border rounded-lg overflow-hidden ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} ${isFocused ? 'ring-2 ring-indigo-500' : ''} ${className}`}>
        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          {toolbarButtons.map((btn, idx) => (
            btn.divider ? (
              <div key={`divider-${idx}`} className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>
            ) : (
              <button
                key={idx}
                type="button"
                onClick={() => btn.action ? btn.action() : execCommand(btn.command, btn.value)}
                title={btn.title}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-700 dark:text-gray-300"
                disabled={disabled}
              >
                {typeof btn.icon === 'function' ? <btn.icon className="h-4 w-4" /> : <btn.icon className="h-4 w-4" />}
              </button>
            )
          ))}
        </div>

        {/* Editor Content */}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          dangerouslySetInnerHTML={{ __html: value }}
          className="p-3 outline-none min-h-[200px] overflow-y-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-white prose prose-sm max-w-none"
          style={{ minHeight: height }}
          data-placeholder={placeholder}
        />
      </div>
      
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{helperText}</p>}

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Insert Link</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link Text (Optional)</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Display text"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowLinkModal(false);
                    setLinkUrl('');
                    setLinkText('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={insertLink}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Insert Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        [contentEditable=true]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contentEditable=true] a {
          color: #4f46e5;
          text-decoration: underline;
        }
        [contentEditable=true] pre {
          background-color: #f3f4f6;
          padding: 0.75rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }
        [contentEditable=true] ul, [contentEditable=true] ol {
          padding-left: 1.5rem;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;