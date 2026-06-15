import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { DeleteDialog } from './DeleteDialog';
import { CodeBlock } from './CodeBlock';
import { LanguageFilter } from './LanguageFilter';
import { CategoryFilter } from './CategoryFilter';
import { LanguageIcon } from './LanguageIcon';
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

interface Post {
  id: string;
  title: string;
  code: string;
  language: string;
  author: string;
  createdAt: string;
  category?: string;
  folderId?: string | null;
  lastModified?: string;
}

interface PostListProps {
  selectedFolder: string | null;
  onPostsChange: (posts: Post[]) => void;
  selectedItems: SelectedItem[];
  onItemSelect: (item: SelectedItem) => void;
}

export function PostList({ selectedFolder, onPostsChange, selectedItems, onItemSelect }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    let q;
    if (selectedFolder) {
      q = query(
        collection(db, 'posts'),
        where('folderId', '==', selectedFolder),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      setPosts(postsData);
      onPostsChange(postsData);
    });

    return () => unsubscribe();
  }, [selectedFolder, onPostsChange]);

  const handleDragStart = (e: React.DragEvent, post: Post) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      itemId: post.id,
      itemType: 'snippet'
    }));
  };

  const moveToFolder = async (postId: string, folderId: string | null) => {
    try {
      await updateDoc(doc(db, 'posts', postId), {
        folderId: folderId
      });
      toast.success('Post moved successfully!');
    } catch (error) {
      console.error('Error moving post:', error);
      toast.error('Failed to move post');
    }
  };

  const isSelected = (postId: string) => {
    return selectedItems.some(item => item.id === postId);
  };

  const handleSelectPost = (post: Post) => {
    const selectedItem: SelectedItem = {
      id: post.id,
      title: post.title,
      code: post.code,
      language: post.language,
      author: post.author,
      type: 'snippet'
    };
    onItemSelect(selectedItem);
  };

  const handleCodeUpdate = (postId: string, newCode: string) => {
    // Update the local state immediately for better UX
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, code: newCode, lastModified: new Date().toISOString() }
          : post
      )
    );
  };

  const togglePost = (postId: string) => {
    setExpandedPost(expandedPost === postId ? null : postId);
  };

  const handleDelete = async (postId: string) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      toast.success('Post deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete post');
      throw error;
    }
  };

  const filteredPosts = selectedLanguage
    ? posts.filter(post => post.language === selectedLanguage)
    : posts;
    
  const finalFilteredPosts = selectedCategory
    ? filteredPosts.filter(post => post.category === selectedCategory)
    : filteredPosts;

  // Pagination logic
  const totalPages = Math.ceil(finalFilteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPosts = finalFilteredPosts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedLanguage, selectedCategory]);

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

  if (selectedFolder && finalFilteredPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📁</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No code snippets in this folder
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Create a new snippet or move existing ones here
        </p>
      </div>
    );
  }

  if (!selectedFolder && finalFilteredPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">💻</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No code snippets yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Share your first code snippet to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
        <LanguageFilter
          selectedLanguage={selectedLanguage}
          onLanguageSelect={setSelectedLanguage}
        />
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
      </div>

      <div className="space-y-4">
        {paginatedPosts.map((post) => (
          <div
            key={post.id}
            data-post-id={post.id}
            draggable
            onDragStart={(e) => handleDragStart(e, post)}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mobile-card"
          >
            <div className="px-3 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-start sm:items-center justify-between mb-2 sm:mb-0">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={isSelected(post.id)}
                    onChange={() => handleSelectPost(post)}
                    className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 flex-shrink-0"
                  />
                  <LanguageIcon language={post.language} size="sm" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-100 truncate">{post.title}</h3>
                  </div>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => togglePost(post.id)}
                    data-expand-button
                    className="p-1 sm:p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                  >
                    {expandedPost === post.id ? (
                      <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={() => setDeletePostId(post.id)}
                    className="p-1 sm:p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                    title="Delete post"
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <span>Language: {post.language}</span>
                  {post.category && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                        {getCategoryLabel(post.category)}
                      </span>
                    </>
                  )}
                  {post.lastModified && (
                    <>
                      <span className="hidden sm:inline">•</span>
                      <span className="text-xs">Modified: {new Date(post.lastModified).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {expandedPost === post.id && (
              <div className="px-3 sm:px-6 pb-3 sm:pb-4 expanded">
                <CodeBlock
                  code={post.code}
                  language={post.language}
                  title={post.title}
                  author={post.author}
                  postId={post.id}
                  onCodeUpdate={(newCode) => handleCodeUpdate(post.id, newCode)}
                />
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-600 dark:text-gray-400 space-y-2 sm:space-y-0">
                  <span>Posted by: {post.author}</span>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
                    <span>Created: {new Date(post.createdAt).toLocaleDateString()}</span>
                    {post.lastModified && (
                      <span>Modified: {new Date(post.lastModified).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={handleItemsPerPageChange}
        totalItems={finalFilteredPosts.length}
      />

      <DeleteDialog
        isOpen={deletePostId !== null}
        onClose={() => setDeletePostId(null)}
        onConfirm={() => deletePostId && handleDelete(deletePostId)}
      />
    </div>
  );
}