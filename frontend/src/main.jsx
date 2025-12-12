import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.css'
import App from './App.jsx'
import Login from './Login.jsx'


createRoot(document.getElementById('root')).render(
  <StrictMode>
        <div>
            <Login/>
        </div>
  </StrictMode>,
)
