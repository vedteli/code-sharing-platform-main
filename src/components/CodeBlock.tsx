import { useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Copy, Download, Play, Edit3 } from 'lucide-react';
import { downloadCode } from '../lib/download';
import { executeCode } from '../lib/piston';
import { PISTON_LANGUAGE_MAPPING } from '../lib/constants';
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
  const [output, setOutput] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
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

  const handleExecute = async () => {
    const pistonLanguage = PISTON_LANGUAGE_MAPPING[language];
    if (!pistonLanguage) {
      toast.error('Code execution is not supported for this language');
      return;
    }

    setIsExecuting(true);
    setOutput(null); // Clear previous output

    try {
      const result = await executeCode(pistonLanguage, currentCode);
      
      if (result.run.code === 0) {
        setOutput(result.run.output || 'Program executed successfully with no output');
        toast.success('Code executed successfully!');
      } else if (result.error) {
        setOutput(result.error.message);
        toast.error(result.error.type === 'timeout' ? 'Program timed out' : 'Execution failed');
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
      toast.error('Failed to execute code');
    } finally {
      setIsExecuting(false);
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
          
          {PISTON_LANGUAGE_MAPPING[language] && (
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="p-1.5 sm:p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              title="Execute code"
            >
              <Play className="responsive-icon" />
            </button>
          )}
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
      
      {output && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 sm:p-4 font-mono text-xs sm:text-sm">
          <h4 className="text-xs sm:text-sm font-medium mb-2">Output:</h4>
          <pre className="whitespace-pre-wrap break-words overflow-x-auto">{output}</pre>
        </div>
      )}
    </div>
  );
}