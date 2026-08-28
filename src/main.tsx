import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';
import { PrivacyConsentProvider } from './context/PrivacyConsentContext.tsx';
import './index.css';
import { reportClientError } from './lib/clientErrorReport.ts';

window.addEventListener('error', (event) => {
  reportClientError('window.error', event.error ?? event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  reportClientError('window.promise', event.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PrivacyConsentProvider>
      <AuthProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </AuthProvider>
    </PrivacyConsentProvider>
  </StrictMode>,
);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js');
  });
}
