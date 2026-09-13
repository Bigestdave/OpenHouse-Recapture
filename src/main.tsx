import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Automatically redirect standard direct pathnames (e.g. /portal, /properties) to HashRouter paths
if (typeof window !== 'undefined' && window.location.pathname && window.location.pathname !== '/' && !window.location.hash) {
  window.location.replace(`/#${window.location.pathname}${window.location.search}`)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
