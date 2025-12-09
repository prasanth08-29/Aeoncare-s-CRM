import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import axios from 'axios'

// Set base URL for production
// If VITE_API_URL is set (in Vercel), use it. Otherwise use localhost.
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";




createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
