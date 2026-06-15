import React from 'react';
import { RefreshCw, X } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export function PWAUpdateNotification() {
  const { isUpdateAvailable, updateApp } = usePWA();
  const [showNotification, setShowNotification] = React.useState(false);

  React.useEffect(() => {
    if (isUpdateAvailable) {
      setShowNotification(true);
    }
  }, [isUpdateAvailable]);

  const handleUpdate = () => {
    updateApp();
    setShowNotification(false);
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  if (!showNotification) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow-lg p-4 z-50 animate-slide-down">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
            Update Available
          </h3>
          <p className="text-xs text-green-700 dark:text-green-300 mb-3">
            A new version of CodeShare is ready to install.
          </p>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleUpdate}
              className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Update Now</span>
            </button>
            
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-xs text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 transition-colors"
            >
              Later
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}