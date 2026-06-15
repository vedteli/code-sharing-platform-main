import { useState } from 'react';
import { Upload } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import toast from 'react-hot-toast';

export function FileUploader() {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const items = Array.from(e.dataTransfer.items);
    const folders = items.filter(item => {
      const entry = item.webkitGetAsEntry();
      return entry && entry.isDirectory;
    });

    if (folders.length === 0) {
      toast.error('Please drop a folder');
      return;
    }

    try {
      const folder = folders[0].webkitGetAsEntry();
      if (folder) {
        const folderData = {
          folder_name: folder.name,
          author_name: 'Anonymous', // You might want to add an input for this
          time: new Date().toISOString(),
        };

        await addDoc(collection(db, 'folders'), folderData);
        toast.success('Folder uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading folder:', error);
      toast.error('Failed to upload folder');
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center transition-colors
        ${isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'}
      `}
    >
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Drag and drop a folder here
      </p>
    </div>
  );
}