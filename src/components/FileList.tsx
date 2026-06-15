import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, increment, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { File, Download, Trash2, Copy, Check } from 'lucide-react';
import { DeleteDialog } from './DeleteDialog';
import { PasswordPrompt } from './PasswordPrompt';
import { CategoryFilter } from './CategoryFilter';
import { Pagination } from './Pagination';
import { CATEGORIES } from '../lib/constants';
import toast from 'react-hot-toast';

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

interface FileItem {
  id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  fileData: string;
  password: string;
  category?: string;
  uploadedAt: string;
  downloads: number;
  folderId?: string | null;
}

interface FileListProps {
  selectedFolder: string | null;
  onFilesChange: (files: FileItem[]) => void;
  selectedItems: SelectedItem[];
  onItemSelect: (item: SelectedItem) => void;
}

export function FileList({ selectedFolder, onFilesChange, selectedItems, onItemSelect }: FileListProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null);
  const [downloadFile, setDownloadFile] = useState<FileItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    let q;
    if (selectedFolder) {
      q = query(
        collection(db, 'files'),
        where('folderId', '==', selectedFolder),
        orderBy('uploadedAt', 'desc')
      );
    } else {
      q = query(collection(db, 'files'), orderBy('uploadedAt', 'desc'));
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FileItem[];
      setFiles(filesData);
      onFilesChange(filesData);
    });

    return () => unsubscribe();
  }, [selectedFolder, onFilesChange]);

  const filteredFiles = selectedCategory
    ? files.filter(file => file.category === selectedCategory)
    : files;

  // Pagination logic
  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedFiles = filteredFiles.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of the list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };
    
  const getCategoryLabel = (categoryValue: string) => {
    return CATEGORIES.find(cat => cat.value === categoryValue)?.label || categoryValue;
  };
  
  const getCategoryColor = (categoryValue: string) => {
    const colors: Record<string, string> = {
      'stats': 'bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-300',
      'ai-ml': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      'mern': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'ethical-hacking': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      'information-retrieval': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300',
    };
    return colors[categoryValue] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  };
  const handleDragStart = (e: React.DragEvent, file: FileItem) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      itemId: file.id,
      itemType: 'file'
    }));
  };

  const isSelected = (fileId: string) => {
    return selectedItems.some(item => item.id === fileId);
  };

  const handleSelectFile = (file: FileItem) => {
    const selectedItem: SelectedItem = {
      id: file.id,
      title: file.fileName,
      code: file.fileData, // Using fileData as code content
      language: 'plaintext', // Default language for files
      author: 'File Upload',
      type: 'file',
      fileName: file.fileName,
      originalName: file.originalName
    };
    onItemSelect(selectedItem);
  };

  const handleDelete = async (fileId: string) => {
    try {
      await deleteDoc(doc(db, 'files', fileId));
      toast.success('File deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete file');
      throw error;
    }
  };

  const handleDownloadRequest = (file: FileItem) => {
    setDownloadFile(file);
  };

  const handleDownloadSuccess = async () => {
    if (!downloadFile) return;

    try {
      // Convert base64 back to blob
      const byteCharacters = atob(downloadFile.fileData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: downloadFile.fileType });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadFile.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Update download count
      const docRef = doc(db, 'files', downloadFile.id);
      await updateDoc(docRef, {
        downloads: increment(1)
      });

      toast.success('File downloaded successfully!');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    } finally {
      setDownloadFile(null);
    }
  };

  const copyFileLink = async (fileId: string) => {
    const link = `${window.location.origin}/file/${fileId}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(fileId);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType.startsWith('video/')) return '🎥';
    if (fileType.startsWith('audio/')) return '🎵';
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('zip') || fileType.includes('archive')) return '📦';
    return '📄';
  };

  if (selectedFolder && filteredFiles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📁</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No files in this folder
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Upload a new file or move existing ones here
        </p>
      </div>
    );
  }

  if (filteredFiles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📁</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No files uploaded yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Upload your first file to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
          📂 Uploaded Files ({filteredFiles.length})
        </h2>
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
      </div>
      
      <div className="grid gap-4">
        {paginatedFiles.map((file) => (
          <div
            key={file.id}
            data-file-id={file.id}
            draggable
            onDragStart={(e) => handleDragStart(e, file)}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md mobile-card hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3 flex-1 min-w-0 order-1 sm:order-none">
                <input
                  type="checkbox"
                  checked={isSelected(file.id)}
                  onChange={() => handleSelectFile(file)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 flex-shrink-0"
                />
                <div className="file-emoji">
                  {getFileIcon(file.fileType)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">
                    {file.fileName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    <span className="whitespace-nowrap">{formatFileSize(file.fileSize)}</span>
                    <span className="whitespace-nowrap">{formatDate(file.uploadedAt)}</span>
                    {file.category && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(file.category)}`}>
                        {getCategoryLabel(file.category)}
                      </span>
                    )}
                    <span className="flex items-center space-x-1 whitespace-nowrap">
                      <Download className="w-3 h-3 flex-shrink-0" />
                      <span>{file.downloads}</span>
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-1 sm:space-x-2 order-2 sm:order-none">
                <button
                  onClick={() => handleDownloadRequest(file)}
                  className="p-1.5 sm:p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-full transition-colors"
                  title="Download file"
                >
                  <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => copyFileLink(file.id)}
                  className="p-1.5 sm:p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                  title="Copy link"
                >
                  {copiedId === file.id ? (
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  )}
                </button>
                <button
                  onClick={() => setDeleteFileId(file.id)}
                  className="p-1.5 sm:p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                  title="Delete file"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 sm:block">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 dark:text-gray-400 space-y-1 sm:space-y-0">
                <span>Password protected</span>
                <span className="truncate">Original: {file.originalName}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        totalItems={filteredFiles.length}
      />

      <DeleteDialog
        isOpen={deleteFileId !== null}
        onClose={() => setDeleteFileId(null)}
        onConfirm={() => deleteFileId && handleDelete(deleteFileId)}
      />

      <PasswordPrompt
        isOpen={downloadFile !== null}
        onClose={() => setDownloadFile(null)}
        onSuccess={handleDownloadSuccess}
        fileName={downloadFile?.fileName || ''}
        correctPassword={downloadFile?.password || ''}
      />
    </div>
  );
}