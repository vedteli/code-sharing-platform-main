import { useMemo } from 'react';
import { SearchResult } from '../types/search';

interface Post {
  id: string;
  title: string;
  language: string;
  author: string;
  category?: string;
  createdAt: string;
  folderId?: string | null;
}

interface FileItem {
  id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  category?: string;
  uploadedAt: string;
  folderId?: string | null;
}

interface UseSearchProps {
  posts: Post[];
  files: FileItem[];
}

export function useSearch({ posts, files }: UseSearchProps) {
  const searchFunction = useMemo(() => {
    return (query: string): SearchResult[] => {
      if (!query.trim()) return [];

      const searchTerm = query.toLowerCase();
      const results: SearchResult[] = [];

      // Build folder path lookup
      // const getFolderPath = (folderId: string | null): string => {
        // if (!folderId) return '';
        
        // const folder = folders.find(f => f.id === folderId);
        // if (!folder) return '';
        
        // const parentPath = getFolderPath(folder.parentId);
        // return parentPath ? `${parentPath} > ${folder.name}` : folder.name;
      // };


      // Search code snippets
      posts.forEach(post => {
        const titleMatch = post.title.toLowerCase().includes(searchTerm);
        const languageMatch = post.language.toLowerCase().includes(searchTerm);
        const authorMatch = post.author.toLowerCase().includes(searchTerm);
        const categoryMatch = post.category?.toLowerCase().includes(searchTerm);
        
        if (titleMatch || languageMatch || authorMatch || categoryMatch) {
          results.push({
            id: post.id,
            title: post.title,
            type: 'snippet',
            // path: getFolderPath(post.folderId),
            language: post.language,
            author: post.author,
            createdAt: post.createdAt,
          });
        }
      });

      // Search files
      files.forEach(file => {
        const fileNameMatch = file.fileName.toLowerCase().includes(searchTerm);
        const originalNameMatch = file.originalName.toLowerCase().includes(searchTerm);
        const extensionMatch = file.originalName.toLowerCase().split('.').pop()?.includes(searchTerm);
        const categoryMatch = file.category?.toLowerCase().includes(searchTerm);
        
        if (fileNameMatch || originalNameMatch || extensionMatch || categoryMatch) {
          results.push({
            id: file.id,
            title: file.fileName,
            type: 'file',
            // path: getFolderPath(file.folderId),
            createdAt: file.uploadedAt,
          });
        }
      });

      // Sort results by relevance (exact matches first, then partial matches)
      return results.sort((a, b) => {
        const aExact = a.title.toLowerCase() === searchTerm;
        const bExact = b.title.toLowerCase() === searchTerm;
        
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        
        const aStarts = a.title.toLowerCase().startsWith(searchTerm);
        const bStarts = b.title.toLowerCase().startsWith(searchTerm);
        
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        
        return a.title.localeCompare(b.title);
      });
    };
  }, [posts, files]);

  return searchFunction;
}