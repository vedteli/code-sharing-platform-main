import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import CodeAPI from './pages/CodeAPI.tsx';
import './index.css';

// Check if we're on the /code route
const isCodeRoute = window.location.pathname === '/code';

// Prevent scrolling during intro animation (only for main app)
if (!isCodeRoute) {
  document.body.classList.add('intro-active');

  // Remove intro class after animation completes
  setTimeout(() => {
    document.body.classList.remove('intro-active');
  }, 5000);
}

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Check every minute
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isCodeRoute ? <CodeAPI /> : <App />}
  </StrictMode>
);
