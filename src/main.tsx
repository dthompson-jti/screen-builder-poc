// src/main.tsx
// This is the application's entry point.
// NOTE: This file is at the root of /src, so imports from sibling directories
// like /state or /components will start with './'.

import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'jotai'
import * as Toast from '@radix-ui/react-toast';
import App from './App.tsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider>
      <Toast.Provider swipeDirection="down">
        <App />
      </Toast.Provider>
    </Provider>
  </React.StrictMode>,
)