import React, { useState } from 'react';
import { PostForm } from './components/PostForm';
import { PostList } from './components/PostList';
import { FileUpload } from './components/FileUpload';
import { FileList } from './components/FileList';
import { UniversalSearch } from './components/UniversalSearch';
import { Modal } from './components/Modal';
import { Navbar } from './components/Navbar';
import { ThemeProvider } from './components/ThemeProvider';
import { useSearch } from './hooks/useSearch';
import { Plus, Upload } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { SearchResult } from './types/search';
import { SelectionManager } from './components/SelectionManager';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { PWAUpdateNotification } from './components/PWAUpdateNotification';
import { OfflineIndicator } from './components/OfflineIndicator';

interface SelectedItem {
  id: string;
  title: string;
  code: string;
  language: string;
  author: string;
  type: 'snippet' | 'file';
  fileName?: string;
  originalName?: string;
}

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'files'>('code');
  const [posts, setPosts] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  
  const searchFunction = useSearch({ posts, files: [] });

  const handleItemSelect = (item: SelectedItem) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleRemoveSelectedItem = (id: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  const handleSearchResult = (result: SearchResult) => {
    // Switch to appropriate tab
    if (result.type === 'snippet') {
      setActiveTab('code');
    } else if (result.type === 'file') {
      setActiveTab('files');
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Toaster position="top-right" />
        <PWAUpdateNotification />
        <OfflineIndicator />
        <Navbar showLogo={true} />
        
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <div className="mb-6">
            <UniversalSearch
              onSearch={searchFunction}
              onResultClick={handleSearchResult}
            />
          </div>
        </div>
        
        <div className="px-3 sm:px-6 pb-20 sm:pb-6">
            <div className="mb-6">
              <div className="flex space-x-1 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg w-full sm:w-fit mobile-scroll">
                <button
                  onClick={() => {
                    setActiveTab('code');
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'code'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  💻 Code Snippets
                </button>
                <button
                  onClick={() => {
                    setActiveTab('files');
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'files'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  📁 File Sharing
                </button>
              </div>
            </div>
            
            <SelectionManager
              selectedItems={selectedItems}
              onRemoveItem={handleRemoveSelectedItem}
              onClearAll={handleClearSelection}
            />
            
            {activeTab === 'code' ? (
              <PostList 
                selectedFolder={null}
                onPostsChange={setPosts}
                selectedItems={selectedItems}
                onItemSelect={handleItemSelect}
              />
            ) : (
              <FileList 
                selectedFolder={null}
                onFilesChange={setFiles}
                selectedItems={selectedItems}
                onItemSelect={handleItemSelect}
              />
            )}
          </div>

        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col space-y-2 sm:space-y-3 z-30">
          {activeTab === 'files' && (
            <button
              onClick={() => setIsFileModalOpen(true)}
              className="p-3 sm:p-4 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
              title="Upload File"
            >
              <Upload className="responsive-icon" />
            </button>
          )}
          
          {activeTab === 'code' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-3 sm:p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              title="Share Code"
            >
              <Plus className="responsive-icon" />
            </button>
          )}
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Share Your Code"
        >
          <PostForm 
            selectedFolder={null}
            onSuccess={() => setIsModalOpen(false)} 
          />
        </Modal>

        <Modal
          isOpen={isFileModalOpen}
          onClose={() => setIsFileModalOpen(false)}
          title="Upload & Share File"
        >
          <FileUpload 
            selectedFolder={null}
            onSuccess={() => setIsFileModalOpen(false)} 
          />
        </Modal>

        <PWAInstallPrompt />
      </div>
    </ThemeProvider>
  );
}

export default App;