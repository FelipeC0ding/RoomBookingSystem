import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.css'
import AuthFlow from './AuthFlow'


createRoot(document.getElementById('root')).render(
  <StrictMode>
        <div>
            <AuthFlow/>
        </div>
  </StrictMode>,
)
