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
  
  // Create visible error overlay using safe DOM manipulation
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
  
  // Create header
  const header = document.createElement('div');
  header.style.cssText = 'font-weight: bold; margin-bottom: 8px;';
  header.textContent = '⚠️ Runtime Error';
  
  // Create message
  const message = document.createElement('div');
  message.style.cssText = 'word-break: break-word;';
  message.textContent = event.error?.message || event.message || 'Unknown error';
  
  // Create footer
  const footer = document.createElement('div');
  footer.style.cssText = 'margin-top: 8px; font-size: 10px; opacity: 0.8;';
  footer.textContent = 'Check console for details';
  
  errorOverlay.appendChild(header);
  errorOverlay.appendChild(message);
  errorOverlay.appendChild(footer);
  document.body.appendChild(errorOverlay);
});

console.log('[App Boot] Global error handler installed');

const queryClient = new QueryClient()

// Get root element with defensive check
const rootElement = document.getElementById('root');

if (!rootElement) {
  const errorMessage = 'FATAL ERROR: Root element not found! The page HTML must contain a div with id="root"';
  console.error('[App Boot]', errorMessage);
  
  // Create error display using safe DOM manipulation
  const errorContainer = document.createElement('div');
  errorContainer.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    font-family: system-ui, -apple-system, sans-serif;
    background: #f5f5f5;
    padding: 20px;
  `;
  
  const errorBox = document.createElement('div');
  errorBox.style.cssText = `
    background: white;
    padding: 40px;
    border-radius: 12px;
    max-width: 500px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  `;
  
  const title = document.createElement('h1');
  title.style.cssText = 'color: #ff4444; margin: 0 0 16px 0;';
  title.textContent = '⚠️ Application Error';
  
  const description = document.createElement('p');
  description.style.cssText = 'margin: 0 0 16px 0; color: #333;';
  description.textContent = 'The application failed to initialize. Root element not found.';
  
  const support = document.createElement('p');
  support.style.cssText = 'margin: 0; color: #666; font-size: 14px;';
  support.textContent = 'Please contact support or check the browser console for details.';
  
  errorBox.appendChild(title);
  errorBox.appendChild(description);
  errorBox.appendChild(support);
  errorContainer.appendChild(errorBox);
  
  // Clear body and append error
  document.body.innerHTML = '';
  document.body.appendChild(errorContainer);
  
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
