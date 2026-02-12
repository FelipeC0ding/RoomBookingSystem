import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AuthFlow from './AuthFlow'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthFlow />
    </BrowserRouter>
  </StrictMode>,
)
