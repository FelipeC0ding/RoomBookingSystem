import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AuthFlow from './AuthFlow'
import { BrowserRouter } from 'react-router-dom' 


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthFlow />
    </BrowserRouter>
  </StrictMode>,
)
