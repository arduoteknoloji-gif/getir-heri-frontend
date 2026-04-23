import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// API URL tanımı (boşluk yok)
window.API_BASE_URL = "https://getir-heri.onrender.com/api";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);