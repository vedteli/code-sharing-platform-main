import React, { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Save, X, RotateCcw, History, Check } from 'lucide-react';
import { useTheme } from 'next-themes';
import { doc, updateDoc, addDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

interface CodeEditorProps {
  code: string;
  language: string;
  postId: string;
  title: string;
  author: string;
  onSave: (newCode: string) => void;
  onCancel: () => void;
}

interface CodeVersion {
  id: string;
  code: string;
  timestamp: string;
  version: number;
}

export function CodeEditor({ code, language, postId, title, author, onSave, onCancel }: CodeEditorProps) {
  const [editorCode, setEditorCode] = useState(code);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versions, setVersions] = useState<CodeVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const editorRef = useRef<any>(null);
  const { theme } = useTheme();

  useEffect(() => {
    setHasChanges(editorCode !== code);
  }, [editorCode, code]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      lineHeight: 20,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: 'on',
      lineNumbers: 'on',
      folding: true,
      bracketMatching: 'always',
      autoIndent: 'full',
    });
  };

  const handleEditorDidMountWithMonaco = (editor: any, monaco: any) => {
    handleEditorDidMount(editor);
    
    // Add keyboard shortcuts using monaco instance
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });

    editor.addCommand(monaco.KeyCode.Escape, () => {
      if (hasChanges) {
        const confirmed = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
        if (confirmed) {
          onCancel();
        }
      } else {
        onCancel();
      }
    });
  };

  const createBackupVersion = async () => {
    try {
      // Get all versions for this post to determine the next version number
      const versionsQuery = query(
        collection(db, 'code_versions'),
        where('postId', '==', postId)
      );
      
      const versionsSnapshot = await getDocs(versionsQuery);
      const versions = versionsSnapshot.docs.map(doc => doc.data().version || 0);
      const latestVersion = versions.length > 0 ? Math.max(...versions) : 0;

      // Create backup of current version
      await addDoc(collection(db, 'code_versions'), {
        postId,
        code,
        timestamp: new Date().toISOString(),
        version: latestVersion + 1,
        title,
        author,
      });
    } catch (error) {
      console.error('Error creating backup version:', error);
      // Don't block the save if backup fails
    }
  };

  const handleSave = async () => {
    if (!hasChanges) {
      toast.info('No changes to save');
      return;
    }

    setIsSaving(true);
    try {
      // Create backup before saving
      await createBackupVersion();

      // Update the main post
      await updateDoc(doc(db, 'posts', postId), {
        code: editorCode,
        lastModified: new Date().toISOString(),
      });

      onSave(editorCode);
      toast.success('Code saved successfully!');
    } catch (error) {
      console.error('Error saving code:', error);
      toast.error('Failed to save code');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (hasChanges) {
      const confirmed = window.confirm('Are you sure you want to discard your changes?');
      if (confirmed) {
        setEditorCode(code);
        setHasChanges(false);
      }
    }
  };

  const loadVersionHistory = async () => {
    setIsLoadingVersions(true);
    try {
      // Get all versions for this post and sort them client-side
      const versionsQuery = query(
        collection(db, 'code_versions'),
        where('postId', '==', postId)
      );
      
      const versionsSnapshot = await getDocs(versionsQuery);
      const versionData = versionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as CodeVersion[];
      
      // Sort by version descending and limit to 10 most recent
      const sortedVersions = versionData
        .sort((a, b) => (b.version || 0) - (a.version || 0))
        .slice(0, 10);
      
      setVersions(sortedVersions);
      setShowVersionHistory(true);
    } catch (error) {
      console.error('Error loading version history:', error);
      toast.error('Failed to load version history');
    } finally {
      setIsLoadingVersions(false);
    }
  };

  const restoreVersion = async (version: CodeVersion) => {
    const confirmed = window.confirm(`Restore to version ${version.version}? This will replace your current code.`);
    if (confirmed) {
      setEditorCode(version.code);
      setShowVersionHistory(false);
      toast.success(`Restored to version ${version.version}`);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      {/* Editor Header */}
      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-t-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Editing: {title}
          </span>
          {hasChanges && (
            <span className="text-xs bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full">
              Unsaved changes
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={loadVersionHistory}
            disabled={isLoadingVersions}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Version History"
          >
            <History className="w-4 h-4" />
          </button>
          
          <button
            onClick={handleDiscard}
            disabled={!hasChanges}
            className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
            title="Discard Changes"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
          
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span className="text-sm">Save</span>
          </button>
          
          <button
            onClick={onCancel}
            className="flex items-center space-x-1 px-3 py-1.5 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="text-sm">Cancel</span>
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-b-lg overflow-hidden">
        <Editor
          height="400px"
          language={language}
          value={editorCode}
          onChange={(value) => setEditorCode(value || '')}
          onMount={handleEditorDidMountWithMonaco}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: 'line',
            automaticLayout: true,
          }}
        />
      </div>

      {/* Keyboard Shortcuts Info */}
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded border border-gray-200 dark:border-gray-700">
        <strong>Shortcuts:</strong> Ctrl/Cmd + S to save • Esc to cancel • Full VS Code editing features available
      </div>

      {/* Version History Modal */}
      {showVersionHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Version History
              </h3>
              <button
                onClick={() => setShowVersionHistory(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 max-h-96 overflow-y-auto">
              {versions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No version history available</p>
                  <p className="text-sm">Versions are created when you save changes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {versions.map((version) => (
                    <div
                      key={version.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          Version {version.version}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(version.timestamp)}
                        </div>
                      </div>
                      <button
                        onClick={() => restoreVersion(version)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span className="text-sm">Restore</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}