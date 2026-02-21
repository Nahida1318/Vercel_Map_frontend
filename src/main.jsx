import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/Index.css'
import { BrowserRouter } from 'react-router-dom';
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* Wrap your app with BrowserRouter */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
