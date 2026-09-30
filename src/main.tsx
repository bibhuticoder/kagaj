import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

// Disable pinch-to-zoom / multi-touch zoom gestures on mobile browsers
document.addEventListener(
  'gesturestart',
  (e) => {
    e.preventDefault();
  },
  { passive: false }
);

document.addEventListener(
  'gesturechange',
  (e) => {
    e.preventDefault();
  },
  { passive: false }
);

document.addEventListener(
  'gestureend',
  (e) => {
    e.preventDefault();
  },
  { passive: false }
);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
