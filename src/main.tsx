import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/global.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Console log app boot messages
console.log('%c🚀 Logic View Bright Starting...', 'color: #3b82f6; font-size: 16px; font-weight: bold;')
console.log('%c✓ React loaded', 'color: #10b981;')
console.log('%c✓ Vite environment ready', 'color: #10b981;')

// Install global error handler for runtime errors
window.addEventListener('error', (event) => {
  console.error('💥 Runtime Error:', event.error || event.message)
  
  // Create debug overlay
  const overlay = document.createElement('div')
  overlay.className = 'debug-error-overlay'
  overlay.innerHTML = `
    <div class="debug-error-overlay-title">⚠️ Runtime Error Detected</div>
    <div class="debug-error-overlay-message">${event.error?.message || event.message || 'Unknown error'}</div>
  `
  
  // Add close button on click
  overlay.addEventListener('click', () => overlay.remove())
  overlay.style.cursor = 'pointer'
  overlay.title = 'Click to dismiss'
  
  document.body.appendChild(overlay)
  
  // Auto-remove after 10 seconds
  setTimeout(() => overlay.remove(), 10000)
})

// Install global promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('💥 Unhandled Promise Rejection:', event.reason)
  
  const overlay = document.createElement('div')
  overlay.className = 'debug-error-overlay'
  overlay.innerHTML = `
    <div class="debug-error-overlay-title">⚠️ Promise Rejection</div>
    <div class="debug-error-overlay-message">${event.reason?.message || String(event.reason) || 'Unknown rejection'}</div>
  `
  
  overlay.addEventListener('click', () => overlay.remove())
  overlay.style.cursor = 'pointer'
  overlay.title = 'Click to dismiss'
  
  document.body.appendChild(overlay)
  setTimeout(() => overlay.remove(), 10000)
})

const queryClient = new QueryClient()

// Get root element
const rootElement = document.getElementById('root')

if (!rootElement) {
  // If root element not found, show friendly error
  const errorMessage = document.createElement('div')
  errorMessage.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 2rem;
    background-color: #fee2e2;
    border: 2px solid #ef4444;
    border-radius: 0.5rem;
    color: #991b1b;
    font-family: sans-serif;
    text-align: center;
    max-width: 500px;
  `
  errorMessage.innerHTML = `
    <h2 style="margin-bottom: 1rem;">⚠️ Application Error</h2>
    <p>Root element with id "root" not found in the document.</p>
    <p style="margin-top: 1rem; font-size: 0.875rem;">Please check your HTML file.</p>
  `
  document.body.appendChild(errorMessage)
  throw new Error('Root element not found')
}

console.log('%c✓ Root element found', 'color: #10b981;')
console.log('%c✓ Mounting React app...', 'color: #10b981;')

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)

console.log('%c✓ React app mounted successfully', 'color: #10b981; font-weight: bold;')
