import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/i18n'
import '@/index.css'
import { Toaster } from '@/components/ui/sonner'
import App from './App'

const savedTheme = window.localStorage.getItem('theme') ?? 'orange'
document.documentElement.setAttribute('data-theme', savedTheme)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <>
      <App />
      <Toaster richColors position="top-right" />
    </>
  </StrictMode>,
)
