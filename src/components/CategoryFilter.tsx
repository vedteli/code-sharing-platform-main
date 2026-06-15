import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, Filter } from 'lucide-react';
import { CATEGORIES } from '../lib/constants';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
}

export function CategoryFilter({ selectedCategory, onCategorySelect }: CategoryFilterProps) {
  const getCategoryLabel = (value: string | null) => {
    if (!value) return 'All Categories';
    return CATEGORIES.find(cat => cat.value === value)?.label || 'All Categories';
  };

  const getCategoryColor = (value: string | null) => {
    const colors: Record<string, string> = {
      'stats': 'bg-violet-100 text-violet-800 dark:bg-violet-900/20 dark:text-violet-300',
      'ai-ml': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      'mern': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      'ethical-hacking': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      'information-retrieval': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-300',
    };
    return colors[value || ''] || '';
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm">
        <Filter className="w-4 h-4" />
        <span className={`flex items-center space-x-2 ${getCategoryColor(selectedCategory)}`}>
          {selectedCategory && (
            <span className="px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap">
              {getCategoryLabel(selectedCategory)}
            </span>
          )}
          {!selectedCategory && <span className="whitespace-nowrap">All Categories</span>}
        </span>
        <ChevronDown className="h-4 w-4" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="min-w-[200px] bg-white dark:bg-gray-800 rounded-md shadow-lg p-1 border border-gray-200 dark:border-gray-700 z-50">
          <DropdownMenu.Item
            className="flex items-center space-x-2 px-3 py-2 cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 outline-none text-sm"
            onClick={() => onCategorySelect(null)}
          >
            <Filter className="w-4 h-4" />
            <span>All Categories</span>
          </DropdownMenu.Item>
          
          <DropdownMenu.Separator className="my-1 h-px bg-gray-200 dark:bg-gray-700" />
          
          {CATEGORIES.map((category) => (
            <DropdownMenu.Item
              key={category.value}
              className="flex items-center space-x-2 px-3 py-2 cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 outline-none text-sm"
              onClick={() => onCategorySelect(category.value)}
            >
              <span className={`w-3 h-3 rounded-full ${getCategoryColor(category.value)}`}></span>
              <span>{category.label}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}