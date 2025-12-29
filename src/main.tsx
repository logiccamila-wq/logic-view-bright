import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/global.css'

// Console log app boot messages for easier debugging
console.log('🚀 LogicFlow app starting...');
console.log('📦 Environment:', import.meta.env.MODE);

// Install global error handler to catch runtime errors
window.addEventListener('error', (event) => {
  console.error('❌ Runtime Error:', event.error);
  
  // Create or update debug overlay
  let overlay = document.getElementById('error-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'error-overlay';
    overlay.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #ff4444;
      color: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      max-width: 400px;
      z-index: 999999;
      font-family: monospace;
      font-size: 12px;
      line-height: 1.5;
    `;
    document.body.appendChild(overlay);
  }
  
  overlay.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 8px;">⚠️ Runtime Error</div>
    <div>${event.error?.message || event.message || 'Unknown error'}</div>
    <div style="margin-top: 8px; font-size: 10px; opacity: 0.8;">
      ${event.filename || ''}${event.lineno ? ':' + event.lineno : ''}
    </div>
  `;
});

// Get root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  // Show friendly error message if root element not found
  const errorMsg = document.createElement('div');
  errorMsg.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    font-family: system-ui, -apple-system, sans-serif;
    background: #f5f5f5;
    color: #333;
  `;
  errorMsg.innerHTML = `
    <div style="text-align: center; padding: 20px;">
      <h1 style="font-size: 24px; margin-bottom: 16px;">⚠️ Cannot find root element</h1>
      <p>The application requires a div with id="root" to mount.</p>
    </div>
  `;
  document.body.appendChild(errorMsg);
  throw new Error('Root element not found. Cannot mount React app.');
}

console.log('✅ Root element found, mounting app...');

// Mount React App
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

console.log('✅ App mounted successfully!');
