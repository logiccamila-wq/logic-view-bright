import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

console.log('[APP] booting...');

window.addEventListener('error', (ev) => {
  console.error('[GLOBAL ERROR]', ev.message, ev.error || ev);
  const id = 'global-error-overlay';
  if (!document.getElementById(id)) {
    const el = document.createElement('div');
    el.id = id;
    el.style.position = 'fixed';
    el.style.zIndex = '999999';
    el.style.right = '12px';
    el.style.bottom = '12px';
    el.style.background = 'linear-gradient(180deg, rgba(255,55,85,0.95), rgba(220,38,38,0.95))';
    el.style.color = 'white';
    el.style.padding = '10px 14px';
    el.style.borderRadius = '8px';
    el.style.boxShadow = '0 6px 18px rgba(0,0,0,0.15)';
    el.style.fontFamily = 'Inter, system-ui, Arial, sans-serif';
    el.style.maxWidth = '320px';
    el.style.fontSize = '13px';
    el.textContent = 'App error: ' + (ev.message || 'see console');
    document.body.appendChild(el);
  }
});

const container = document.getElementById('root');
if (!container) {
  const bodyMsg = document.createElement('div');
  bodyMsg.style.padding = '24px';
  bodyMsg.style.fontFamily = 'Inter, system-ui, Arial';
  
  const h2 = document.createElement('h2');
  h2.style.color = '#333';
  h2.textContent = 'Erro: elemento ';
  const code = document.createElement('code');
  code.textContent = '#root';
  h2.appendChild(code);
  h2.appendChild(document.createTextNode(' não encontrado'));
  
  const p = document.createElement('p');
  p.textContent = 'Verifique o index.html ou o processo de build.';
  
  bodyMsg.appendChild(h2);
  bodyMsg.appendChild(p);
  document.body.appendChild(bodyMsg);
  throw new Error('Root element not found');
}

const root = createRoot(container);
root.render(<App />);
