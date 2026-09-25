import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import RouteView from './app/RouteView.jsx';
import AnalyticsConsentBanner from './analytics/AnalyticsConsentBanner.jsx';
import { startAnalytics } from './analytics/index.js';

// Keep the requested service in memory before analytics removes URL queries.
// The contact feature validates it against the published service catalogue.
const requestedService = new URLSearchParams(window.location.search).get('service');
startAnalytics();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouteView pathname={window.location.pathname} requestedService={requestedService} />
    <AnalyticsConsentBanner />
  </StrictMode>,
);
