// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'jotai'
import App from './App.tsx'
import './index.css'
import './buttons.css'
import './components/tabs.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider>
      <App />
    </Provider>
  </React.StrictMode>,
)