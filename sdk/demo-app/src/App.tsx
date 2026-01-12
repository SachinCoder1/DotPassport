import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SDKClientProvider } from './hooks/useSDKClient';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ApiClientDemo } from './pages/ApiClientDemo';
import { ReputationWidgetDemo } from './pages/ReputationWidgetDemo';
import { BadgeWidgetDemo } from './pages/BadgeWidgetDemo';
import { ProfileWidgetDemo } from './pages/ProfileWidgetDemo';
import { CategoryWidgetDemo } from './pages/CategoryWidgetDemo';
import { WidgetsOverview } from './pages/WidgetsOverview';
import { ThemeComparison } from './pages/ThemeComparison';
import { ScreenshotGallery } from './pages/ScreenshotGallery';
import './styles/global.css';

function App() {
  return (
    <SDKClientProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/api-client" element={<ApiClientDemo />} />
            <Route path="/reputation-widget" element={<ReputationWidgetDemo />} />
            <Route path="/badge-widget" element={<BadgeWidgetDemo />} />
            <Route path="/profile-widget" element={<ProfileWidgetDemo />} />
            <Route path="/category-widget" element={<CategoryWidgetDemo />} />
            <Route path="/widgets-overview" element={<WidgetsOverview />} />
            <Route path="/theme-comparison" element={<ThemeComparison />} />
            <Route path="/screenshot-gallery" element={<ScreenshotGallery />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </SDKClientProvider>
  );
}

export default App;
