import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/global.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

console.log('[App Boot] Starting application initialization...');

// Install global error handler for runtime errors
window.addEventListener('error', (event) => {
  console.error('[Global Error Handler]', event.error);
  
  // Create visible error overlay
  const errorOverlay = document.createElement('div');
  errorOverlay.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #ff4444;
    color: white;
    padding: 16px;
    border-radius: 8px;
    max-width: 400px;
    font-family: monospace;
    font-size: 12px;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  errorOverlay.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 8px;">⚠️ Runtime Error</div>
    <div style="word-break: break-word;">${event.error?.message || event.message || 'Unknown error'}</div>
    <div style="margin-top: 8px; font-size: 10px; opacity: 0.8;">Check console for details</div>
  `;
  document.body.appendChild(errorOverlay);
});

console.log('[App Boot] Global error handler installed');

const queryClient = new QueryClient()

// Get root element with defensive check
const rootElement = document.getElementById('root');

if (!rootElement) {
  const errorMessage = 'FATAL ERROR: Root element not found! The page HTML must contain a div with id="root"';
  console.error('[App Boot]', errorMessage);
  
  // Show friendly error message in document
  document.body.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    ">
      <div style="
        background: white;
        padding: 40px;
        border-radius: 12px;
        max-width: 500px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      ">
        <h1 style="color: #ff4444; margin: 0 0 16px 0;">⚠️ Application Error</h1>
        <p style="margin: 0 0 16px 0; color: #333;">
          The application failed to initialize. Root element not found.
        </p>
        <p style="margin: 0; color: #666; font-size: 14px;">
          Please contact support or check the browser console for details.
        </p>
      </div>
    </div>
  `;
  throw new Error(errorMessage);
}

console.log('[App Boot] Root element found, mounting React app...');

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)

console.log('[App Boot] React app mounted successfully');
