import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { PoolProvider } from '@/contexts/PoolContext'
import { CurrentWeekProvider } from '@/contexts/CurrentWeekContext'
import { ThemeProvider } from 'next-themes'
import { registerServiceWorker, offlineManager } from '@/utils/service-worker'
import { analyzeBundleSize } from '@/utils/bundle-analysis'

// Initialize performance monitoring
if (process.env.NODE_ENV === 'development') {
  analyzeBundleSize();
}

// Register service worker for offline support
if (process.env.NODE_ENV === 'production') {
  registerServiceWorker({
    onUpdate: (registration) => {
      console.log('🔄 New app version available!');
      // Could show update notification to user
    },
    onSuccess: (registration) => {
      console.log('✅ App ready for offline use');
    },
    onError: (error) => {
      console.error('❌ Service worker registration failed:', error);
    }
  }).catch(console.error);
}

// Setup offline detection
offlineManager.onOffline(() => {
  offlineManager.showOfflineNotification();
});

offlineManager.onOnline(() => {
  offlineManager.hideOfflineNotification();
});

createRoot(document.getElementById("root")!).render(
  <ThemeProvider
    attribute="class"
    defaultTheme="light"
    enableSystem={false}
    disableTransitionOnChange
  >
    <PoolProvider>
      <CurrentWeekProvider>
        <App />
      </CurrentWeekProvider>
    </PoolProvider>
  </ThemeProvider>
);
