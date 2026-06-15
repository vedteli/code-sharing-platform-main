export const EXTENSION_TAG_MAPPING: Record<string, string> = {
  // Programming languages
  '.py': 'python',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.html': 'html',
  '.htm': 'html',
  '.css': 'css',
  '.scss': 'css',
  '.sass': 'css',
  '.java': 'java',
  '.c': 'c',
  '.cpp': 'cpp',
  '.cc': 'cpp',
  '.cxx': 'cpp',
  '.cs': 'csharp',
  '.php': 'php',
  '.rb': 'ruby',
  '.swift': 'swift',
  '.go': 'go',
  '.rs': 'rust',
  '.sql': 'sql',
  '.json': 'json',
  '.xml': 'xml',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.md': 'markdown',
  '.sh': 'bash',
  '.bat': 'batch',
  
  // Documents
  '.pdf': 'pdf',
  '.doc': 'document',
  '.docx': 'document',
  '.txt': 'text',
  '.rtf': 'document',
  '.odt': 'document',
  
  // Images
  '.jpg': 'image',
  '.jpeg': 'image',
  '.png': 'image',
  '.gif': 'image',
  '.svg': 'image',
  '.webp': 'image',
  '.bmp': 'image',
  
  // Archives
  '.zip': 'archive',
  '.rar': 'archive',
  '.7z': 'archive',
  '.tar': 'archive',
  '.gz': 'archive',
  
  // Spreadsheets
  '.xls': 'spreadsheet',
  '.xlsx': 'spreadsheet',
  '.csv': 'spreadsheet',
  '.ods': 'spreadsheet',
  
  // Presentations
  '.ppt': 'presentation',
  '.pptx': 'presentation',
  '.odp': 'presentation',
  
  // Audio/Video
  '.mp3': 'audio',
  '.wav': 'audio',
  '.mp4': 'video',
  '.avi': 'video',
  '.mov': 'video',
};

export const SUBJECT_TAGS = [
  'Information Retrieval',
  'MERN',
  'Stats',
  'Ethical Hacking',
  'AI/ML'
] as const;

export type SubjectTag = typeof SUBJECT_TAGS[number];

export function getExtensionTag(filename: string): string | null {
  const extension = getFileExtension(filename);
  return EXTENSION_TAG_MAPPING[extension] || null;
}

export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.substring(lastDot).toLowerCase();
}

export function formatTag(tag: string): string {
  return `#${tag}`;
}

export function isTagSearch(query: string): boolean {
  return query.trim().startsWith('#');
}

export function extractTagFromSearch(query: string): string {
  return query.trim().substring(1).toLowerCase();
}

export function getTagColor(tag: string): string {
  const colors: Record<string, string> = {
    // Programming languages
    python: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    javascript: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    typescript: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    html: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
    css: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    java: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    c: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    cpp: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    csharp: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
    
    // File types
    pdf: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    document: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    image: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    archive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
    spreadsheet: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
    presentation: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
    audio: 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300',
    video: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
    
    // Subject tags
    'information retrieval': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300',
    'mern': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    'stats': 'bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-300',
    'ethical hacking': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    'ai/ml': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
  };
  
  return colors[tag.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
}