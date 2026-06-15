import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Download, Lock, File, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface FileData {
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  fileData: string;
  password: string;
  uploadedAt: string;
  downloads: number;
}

interface FileDownloadProps {
  fileId: string;
}

export function FileDownload({ fileId }: FileDownloadProps) {
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetchFileData();
  }, [fileId]);

  const fetchFileData = async () => {
    try {
      const docRef = doc(db, 'files', fileId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setFileData(docSnap.data() as FileData);
      } else {
        setError('File not found');
      }
    } catch (error) {
      console.error('Error fetching file:', error);
      setError('Failed to load file');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileData) return;

    if (password === fileData.password) {
      setIsAuthenticated(true);
      toast.success('Access granted!');
    } else {
      toast.error('Incorrect password');
      setPassword('');
    }
  };

  const handleDownload = async () => {
    if (!fileData || !isAuthenticated) return;

    setIsDownloading(true);
    try {
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
      const docRef = doc(db, 'files', fileId);
      await updateDoc(docRef, {
        downloads: increment(1)
      });

      toast.success('File downloaded successfully!');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    } finally {
      setIsDownloading(false);
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              File Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!fileData) return null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <File className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {fileData.fileName}
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p>{formatFileSize(fileData.fileSize)} • {fileData.fileType || 'Unknown type'}</p>
              <p>Uploaded: {formatDate(fileData.uploadedAt)}</p>
              <p>Downloads: {fileData.downloads}</p>
            </div>
          </div>

          {!isAuthenticated ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  🔒 Enter Password to Download
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  This file is password protected
                </p>
              </div>
              
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-colors text-center font-mono"
                placeholder="Enter password"
                required
              />
              
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
              >
                Verify Password
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                <p className="text-green-800 dark:text-green-200 font-medium">
                  ✅ Access Granted
                </p>
                <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                  You can now download this file
                </p>
              </div>
              
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isDownloading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Downloading...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Download File</span>
                  </span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}