import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './fonts.css' // tipografías propias (sin Google Fonts)
import './index.css' // <--- ESTA LÍNEA ES EL CABLE. ASEGÚRATE DE QUE ESTÉ.

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary variant="app">
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)