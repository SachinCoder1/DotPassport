import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useWalletStore } from '~/store/walletStore';
import { useIsClient } from '~/utils/hooks';
import { LoadingScreen } from '~/components/shared/LoadingScreen';
import { ProtectedLayout } from '~/components/shared/ProtectedLayout';
import { APP_NAME } from '~/utils/constants';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('~/pages/LandingPage').then(module => ({ default: module.LandingPage })));
const DashboardPage = lazy(() => import('~/pages/DashboardPage').then(module => ({ default: module.DashboardPage })));
const ApiTestingPage = lazy(() => import('~/pages/ApiTestingPage').then(module => ({ default: module.ApiTestingPage })));
const WidgetTestingPage = lazy(() => import('~/pages/WidgetTestingPage').then(module => ({ default: module.WidgetTestingPage })));
const RequestLogsPage = lazy(() => import('~/pages/RequestLogsPage').then(module => ({ default: module.RequestLogsPage })));
const SettingsPage = lazy(() => import('~/pages/SettingsPage').then(module => ({ default: module.SettingsPage })));

function App() {
  const { isInitializing, isAuthenticated, initialize } = useWalletStore();
  const isClient = useIsClient();

  useEffect(() => {
    initialize(APP_NAME);
  }, [initialize]);

  if (!isClient || isInitializing) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="App">
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            <Route
              path="/"
              element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
              }
            />
            <Route element={<ProtectedLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/api-testing" element={<ApiTestingPage />} />
              <Route path="/widget-testing" element={<WidgetTestingPage />} />
              <Route path="/logs" element={<RequestLogsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            classNames: {
              toast: 'bg-white text-gray-900 border border-gray-200',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
