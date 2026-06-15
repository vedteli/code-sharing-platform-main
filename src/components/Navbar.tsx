import { Code } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  showLogo?: boolean;
}

export function Navbar({ showLogo = false }: NavbarProps) {
  return (
    <nav className="border-b bg-white dark:bg-gray-950 dark:border-gray-800 sticky top-0 z-40">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className={`flex items-center space-x-2 transition-opacity duration-500 ${showLogo ? 'opacity-100' : 'opacity-0'}`}>
            {/* <Code className="responsive-icon text-blue-600" /> */}
            <span className="text-lg sm:text-xl font-semibold navbar-logo">
              <span className="text-blue-600">&lt;&gt;</span>CodeShare
            </span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}