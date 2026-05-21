import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // 🏥 Import the Gatekeeper logic
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App /> {/* ✅ Render App instead of Dashboard */}
  </React.StrictMode>
)