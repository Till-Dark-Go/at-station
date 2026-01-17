/*
This is an old version
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App'

const root = createRoot(document.getElementById('root'))
root.render(
  <StrictMode>
    <App />
  </StrictMode>
)
*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './firebase/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
