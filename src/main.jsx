import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Hide the instant CSS loader once React has mounted & painted first frame
function dismissLoader() {
  const loader = document.getElementById('app-loader')
  if (loader) {
    loader.classList.add('hidden')
    // Remove from DOM after fade finishes to free memory
    setTimeout(() => loader.remove(), 300)
  }
}

const root = createRoot(document.getElementById('root'))
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// requestAnimationFrame ensures loader hides only AFTER first paint is done
requestAnimationFrame(() => requestAnimationFrame(dismissLoader))
