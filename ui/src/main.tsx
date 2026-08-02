import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

(async () => {
  const { Buffer } = await import('buffer');

  if (typeof globalThis !== 'undefined') {
    globalThis.Buffer = Buffer;
  }

  const { default: App } = await import('./App');

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
})();
