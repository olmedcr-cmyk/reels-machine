import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './frekvens'   // tokens + componentes Frekvens (window.Frekvens)
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
