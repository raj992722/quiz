import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// import {Toaster} from '@/components/ui/toaster'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className=' flex flex-col w-screen'>
    <App />
    </div>
    
    {/* <Toaster /> */}
  </StrictMode>,
)
