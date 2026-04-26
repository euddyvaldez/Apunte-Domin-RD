import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './assets/index.css';
import { StoreProvider } from './context/StoreContext';

createRoot(document.getElementById('root')!).render(
  <StoreProvider>
    <App />
  </StoreProvider>,
);
console.log('Applet rendered');
