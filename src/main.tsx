import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { PoolProvider } from '@/contexts/PoolContext'

createRoot(document.getElementById("root")!).render(
  <PoolProvider>
    <App />
  </PoolProvider>
);
