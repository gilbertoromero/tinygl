import React from 'react';
import ReactDOM from 'react-dom/client';
import './themes/dark-theme.css'; // load theme tokens/base before component CSS
import App from './App.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
