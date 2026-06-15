import React from 'react';
import { X, FileText, Code } from 'lucide-react';

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

interface SelectionManagerProps {
  selectedItems: SelectedItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

export function SelectionManager({ selectedItems, onRemoveItem, onClearAll }: SelectionManagerProps) {
  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs sm:text-sm font-medium text-blue-900 dark:text-blue-100">
          Selected for Word Export ({selectedItems.length} items)
        </h3>
        <button
          onClick={onClearAll}
          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors whitespace-nowrap"
        >
          Clear All
        </button>
      </div>
      
      <div className="space-y-2 max-h-24 sm:max-h-32 overflow-y-auto">
        {selectedItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-md p-2 text-xs sm:text-sm"
          >
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              {item.type === 'snippet' ? (
                <Code className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
              ) : (
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
              )}
              <span className="truncate text-gray-900 dark:text-gray-100">
                {item.type === 'snippet' ? item.title : (item.fileName || item.originalName)}
              </span>
              {item.type === 'snippet' && (
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 hidden sm:inline">
                  ({item.language})
                </span>
              )}
            </div>
            <button
              onClick={() => onRemoveItem(item.id)}
              className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
              title="Remove from selection"
            >
              <X className="w-3 h-3 sm:w-3 sm:h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}