export interface SearchResult {
  id: string;
  title: string;
  type: 'snippet' | 'file' | 'folder';
  path?: string;
  language?: string;
  author?: string;
  createdAt?: string;
}