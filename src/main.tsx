import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { PoolProvider } from '@/contexts/PoolContext'
import { ThemeProvider } from 'next-themes'

createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange
  >
    <PoolProvider>
      <App />
    </PoolProvider>
  </ThemeProvider>
);
