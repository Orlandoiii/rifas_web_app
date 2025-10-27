import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './components/lib/components/theme'
import { LoadModalProvider } from './components/lib/components/modal'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" defaultSelectedColor="coral">
      <LoadModalProvider>
          <App />
      </LoadModalProvider>
    </ThemeProvider>
  </StrictMode>,
)
