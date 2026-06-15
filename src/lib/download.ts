import { saveAs } from 'file-saver';
import { LANGUAGE_FILE_EXTENSIONS } from './constants';

export function downloadCode(title: string, author: string, code: string, language: string) {
  const extension = LANGUAGE_FILE_EXTENSIONS[language] || '.txt';
  const sanitizedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const sanitizedAuthor = author.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const filename = `${sanitizedTitle}-${sanitizedAuthor}${extension}`;
  
  const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
  saveAs(blob, filename);
}