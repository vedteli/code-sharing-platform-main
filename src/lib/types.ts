export interface CodeFile {
  id: string;
  name: string;
  lang: string;
  sub: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface FolderMetadata {
  id: string;
  folder_name: string;
  author_name: string;
  time: string;
}