import { useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Copy, Download, Edit3 } from 'lucide-react';
import { downloadCode } from '../lib/download';
import { CodeEditor } from './CodeEditor';
import toast from 'react-hot-toast';


interface CodeBlockProps {
  code: string;
  language: string;
  title: string;
  author: string;
  postId: string;
  onCodeUpdate?: (newCode: string) => void;
}

export function CodeBlock({ code, language, title, author, postId, onCodeUpdate }: CodeBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentCode, setCurrentCode] = useState(code);

  const handleCodeSave = (newCode: string) => {
    setCurrentCode(newCode);
    setIsEditing(false);
    onCodeUpdate?.(newCode);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      toast.success('Code copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const handleDownload = () => {
    try {
      downloadCode(title, author, currentCode, language);
      toast.success('Code downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download code');
    }
  };



  if (isEditing) {
    return (
      <CodeEditor
        code={currentCode}
        language={language}
        postId={postId}
        title={title}
        author={author}
        onSave={handleCodeSave}
        onCancel={handleEditCancel}
      />
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="relative bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
        <div className="absolute top-2 right-2 flex space-x-1 sm:space-x-2 z-10">
          <button
            onClick={() => setIsEditing(true)}
            className="p-1.5 sm:p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Edit code"
          >
            <Edit3 className="responsive-icon" />
          </button>
          <button
            onClick={copyCode}
            className="p-1.5 sm:p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Copy code"
          >
            <Copy className="responsive-icon" />
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 sm:p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            title="Download code"
          >
            <Download className="responsive-icon" />
          </button>
        </div>
        <SyntaxHighlighter
          language={language}
          style={github}
          customStyle={{ 
            margin: 0, 
            padding: '0.75rem', 
            background: 'transparent',
            fontSize: '0.875rem',
            lineHeight: '1.5'
          }}
          wrapLongLines={true}
        >
          {currentCode}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}