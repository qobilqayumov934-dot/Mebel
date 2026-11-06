import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { LanguageProvider } from './i18n.jsx'
import { StoreProvider } from './store.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <LanguageProvider>
      <StoreProvider>
        <App />
      </StoreProvider>
    </LanguageProvider>
  </BrowserRouter>
)
