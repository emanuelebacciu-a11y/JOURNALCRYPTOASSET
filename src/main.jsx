import React from 'react'
import ReactDOM from 'react-dom/client'
import TradingApp from './App.jsx'
import './index.css'

function setVh() {
  const isStandalone =
    ('standalone' in navigator && navigator.standalone === true) ||
    window.matchMedia('(display-mode: standalone)').matches;

  // In standalone su iOS, screen.height è l'unico valore affidabile fin dal primo frame.
  // window.innerHeight e visualViewport possono ancora riportare l'altezza di Safari
  // (765px su iPhone 15 Pro Max) per svariati frame dopo il mount.
  // screen.height è sempre 932 su iPhone 15 Pro Max, indipendente da quando viene letto.
  const h = isStandalone ? screen.height : window.innerHeight;

  document.documentElement.style.setProperty('--app-height', `${h}px`);
  document.documentElement.style.setProperty('--vh', `${h * 0.01}px`);
}

setVh();
window.addEventListener('load', setVh);
window.addEventListener('pageshow', setVh);
window.addEventListener('resize', setVh);
window.addEventListener('orientationchange', () => setTimeout(setVh, 300));

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[SW] Registrato:', reg.scope))
      .catch(err => console.warn('[SW] Fallito:', err));
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TradingApp />
  </React.StrictMode>
)
