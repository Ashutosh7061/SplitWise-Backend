import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { AppProvider } from './context/AppContext';
import './styles/global.css';

const STORAGE_THEME_KEY = 'splitwise.theme';

if (typeof window !== 'undefined') {
  const storedTheme = window.localStorage.getItem(STORAGE_THEME_KEY);
  const initialTheme = storedTheme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = initialTheme;
  document.documentElement.style.colorScheme = initialTheme;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <App />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>
);