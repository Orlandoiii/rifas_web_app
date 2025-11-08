import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './components/lib/components/theme'
import { LoadModalProvider } from './components/lib/components/modal'
import { queryClient } from './lib/queryClient'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" forceDefaultSelectedColor>
        <LoadModalProvider>
          <App />
        </LoadModalProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
