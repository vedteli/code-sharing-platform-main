import React, { useState, useEffect, useRef } from 'react';
import { Search, X, File, Code, Folder, Download } from 'lucide-react';
import { SearchResult } from '../types/search';
import { PasswordPrompt } from './PasswordPrompt';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

interface UniversalSearchProps {
  onSearch: (query: string) => SearchResult[];
  onResultClick: (result: SearchResult) => void;
}

export function UniversalSearch({ onSearch, onResultClick }: UniversalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [downloadFile, setDownloadFile] = useState<{
    id: string;
    fileName: string;
    password: string;
  } | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim()) {
      const searchResults = onSearch(query);
      setResults(searchResults);
      setIsOpen(true);
      setSelectedIndex(-1);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, onSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    onResultClick(result);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
    
    // Scroll to and highlight the item
    setTimeout(() => {
      scrollToAndHighlightItem(result);
    }, 100);
  };

  const scrollToAndHighlightItem = (result: SearchResult) => {
    // Find the element by ID or data attribute
    let element: HTMLElement | null = null;
    
    if (result.type === 'snippet') {
      element = document.querySelector(`[data-post-id="${result.id}"]`);
    } else if (result.type === 'file') {
      element = document.querySelector(`[data-file-id="${result.id}"]`);
    }
    
    if (element) {
      // Scroll to the element
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Add highlight effect
      element.classList.add('search-highlight');
      
      // If it's a collapsible item (like a code snippet), expand it
      const expandButton = element.querySelector('[data-expand-button]') as HTMLButtonElement;
      if (expandButton && !element.querySelector('.expanded')) {
        expandButton.click();
      }
      
      // Remove highlight after animation
      setTimeout(() => {
        element?.classList.remove('search-highlight');
      }, 2000);
    }
  };

  const handleDownloadClick = async (e: React.MouseEvent, result: SearchResult) => {
    e.stopPropagation();
    
    if (result.type !== 'file') {
      toast.error('Only files can be downloaded');
      return;
    }

    try {
      const docRef = doc(db, 'files', result.id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const fileData = docSnap.data();
        setDownloadFile({
          id: result.id,
          fileName: result.title,
          password: fileData.password || '123456'
        });
      } else {
        toast.error('File not found');
      }
    } catch (error) {
      console.error('Error fetching file:', error);
      toast.error('Failed to fetch file details');
    }
  };

  const handleDownloadSuccess = async () => {
    if (!downloadFile) return;

    try {
      const docRef = doc(db, 'files', downloadFile.id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const fileData = docSnap.data();
        
        // Convert base64 back to blob
        const byteCharacters = atob(fileData.fileData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: fileData.fileType });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileData.originalName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Update download count
        await updateDoc(docRef, {
          downloads: increment(1)
        });

        toast.success('File downloaded successfully!');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    } finally {
      setDownloadFile(null);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'snippet':
        return <Code className="responsive-icon text-blue-500" />;
      case 'file':
        return <File className="responsive-icon text-green-500" />;
      case 'folder':
        return <Folder className="responsive-icon text-yellow-500" />;
      default:
        return <File className="responsive-icon text-gray-500" />;
    }
  };

  return (
    <>
      <div ref={searchRef} className="relative w-full max-w-2xl mx-auto px-3 sm:px-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => query.trim() && setIsOpen(true)}
            className="w-full pl-10 pr-10 py-2.5 sm:py-2 text-sm sm:text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors"
            placeholder="Search files, snippets, and folders..."
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-3 h-3 text-gray-400" />
            </button>
          )}
        </div>

        {isOpen && results.length > 0 && (
          <div className="absolute top-full left-3 right-3 sm:left-0 sm:right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-80 sm:max-h-96 overflow-y-auto z-50">
            <div className="p-2">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-2">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </div>
              {results.map((result, index) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className={`flex items-center space-x-3 p-2 rounded-md cursor-pointer transition-colors group ${
                    index === selectedIndex
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => handleResultClick(result)}
                >
                  {getResultIcon(result.type)}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      {highlightText(result.title, query)}
                    </div>
                    {result.path && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        📁 {result.path}
                      </div>
                    )}
                    {result.language && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        {result.language}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                    {result.type === 'file' && (
                      <button
                        onClick={(e) => handleDownloadClick(e, result)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-all"
                        title="Download file"
                      >
                        <Download className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </button>
                    )}
                    <div className="text-xs text-gray-400 capitalize hidden sm:block">
                      {result.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {isOpen && query.trim() && results.length === 0 && (
          <div className="absolute top-full left-3 right-3 sm:left-0 sm:right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium">No results found</p>
              <p className="text-sm">Try searching with different keywords</p>
            </div>
          </div>
        )}
      </div>

      {downloadFile && (
        <PasswordPrompt
          isOpen={downloadFile !== null}
          onClose={() => setDownloadFile(null)}
          onSuccess={handleDownloadSuccess}
          fileName={downloadFile.fileName}
          correctPassword={downloadFile.password}
        />
      )}
    </>
  );
}