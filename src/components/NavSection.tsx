import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { FileUploader } from './FileUploader';

interface NavSectionProps {
  section: string;
}

export function NavSection({ section }: NavSectionProps) {
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);

  const handleSelect = (type: 'lang' | 'sub', value: string) => {
    if (type === 'lang') {
      setSelectedLang(value);
    } else {
      setSelectedSub(value);
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex items-center space-x-1 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
        <span>{section}</span>
        <ChevronDown className="h-4 w-4" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="min-w-[220px] bg-white dark:bg-gray-800 rounded-md shadow-lg p-2">
          {section !== 'Web Dev' ? (
            <>
              <DropdownMenu.Group>
                <DropdownMenu.Label className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                  Language
                </DropdownMenu.Label>
                <DropdownMenu.Item
                  className="px-2 py-1.5 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => handleSelect('lang', section)}
                >
                  {section}
                </DropdownMenu.Item>
              </DropdownMenu.Group>

              <DropdownMenu.Separator className="my-2 h-px bg-gray-200 dark:bg-gray-700" />

              <DropdownMenu.Group>
                <DropdownMenu.Label className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400">
                  Subject
                </DropdownMenu.Label>
                {['DSA', 'Web', 'ML', 'Database'].map((sub) => (
                  <DropdownMenu.Item
                    key={sub}
                    className="px-2 py-1.5 cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleSelect('sub', sub.toLowerCase())}
                  >
                    {sub}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Group>
            </>
          ) : (
            <div className="p-4">
              <FileUploader />
            </div>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}