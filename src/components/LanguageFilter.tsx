import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { LanguageIcon } from './LanguageIcon';

interface LanguageFilterProps {
  selectedLanguage: string | null;
  onLanguageSelect: (language: string | null) => void;
}

export function LanguageFilter({ selectedLanguage, onLanguageSelect }: LanguageFilterProps) {
  const languages = [
    { label: 'All', value: null },
    { label: 'Python', value: 'python' },
    { label: 'C#', value: 'csharp' },
    { label: 'Web Dev', value: 'javascript' }
  ];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm">
        <span className="flex items-center space-x-2">
          {selectedLanguage && <LanguageIcon language={selectedLanguage} size="sm" />}
          <span className="whitespace-nowrap">{selectedLanguage ? languages.find(l => l.value === selectedLanguage)?.label : 'All Languages'}</span>
        </span>
        <ChevronDown className="h-4 w-4" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="min-w-[180px] bg-white dark:bg-gray-800 rounded-md shadow-lg p-1 border border-gray-200 dark:border-gray-700 z-50">
          {languages.map((language) => (
            <DropdownMenu.Item
              key={language.value ?? 'all'}
              className="flex items-center space-x-2 px-3 py-2 cursor-pointer rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 outline-none text-sm"
              onClick={() => onLanguageSelect(language.value)}
            >
              {language.value && <LanguageIcon language={language.value} size="sm" />}
              <span>{language.label}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}