import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';

export function OfflineIndicator() {
  const { isOnline } = usePWA();
  const [showOfflineMessage, setShowOfflineMessage] = React.useState(false);

  React.useEffect(() => {
    if (!isOnline) {
      setShowOfflineMessage(true);
    } else {
      // Hide the message after a brief delay when coming back online
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!showOfflineMessage) {
    return null;
  }

  return (
    <div className={`fixed top-16 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm rounded-lg shadow-lg p-3 z-40 transition-all duration-300 ${
      isOnline 
        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
        : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
    }`}>
      <div className="flex items-center space-x-3">
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isOnline 
            ? 'bg-green-100 dark:bg-green-900/40' 
            : 'bg-yellow-100 dark:bg-yellow-900/40'
        }`}>
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${
            isOnline 
              ? 'text-green-900 dark:text-green-100' 
              : 'text-yellow-900 dark:text-yellow-100'
          }`}>
            {isOnline ? 'Back Online!' : 'You\'re Offline'}
          </p>
          <p className={`text-xs ${
            isOnline 
              ? 'text-green-700 dark:text-green-300' 
              : 'text-yellow-700 dark:text-yellow-300'
          }`}>
            {isOnline 
              ? 'All features are now available' 
              : 'Some features may be limited'
            }
          </p>
        </div>
      </div>
    </div>
  );
}