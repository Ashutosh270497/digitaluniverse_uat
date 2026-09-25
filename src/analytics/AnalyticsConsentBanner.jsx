import { useEffect, useState } from 'react';
import {
  ANALYTICS_CONFIG,
  ANALYTICS_CONSENT,
  ANALYTICS_PREFERENCES_EVENT,
  analytics,
  setAnalyticsConsent,
} from './index.js';

const AnalyticsConsentBanner = () => {
  const [consent, setConsentState] = useState(analytics.getConsent());
  const [preferencesOpen, setPreferencesOpen] = useState(
    consent === ANALYTICS_CONSENT.unknown,
  );

  useEffect(() => analytics.subscribe((nextConsent) => {
    setConsentState(nextConsent);
    setPreferencesOpen(false);
  }), []);

  useEffect(() => {
    const openPreferences = () => setPreferencesOpen(true);
    globalThis.window?.addEventListener?.(ANALYTICS_PREFERENCES_EVENT, openPreferences);
    return () => globalThis.window?.removeEventListener?.(
      ANALYTICS_PREFERENCES_EVENT,
      openPreferences,
    );
  }, []);

  if (!ANALYTICS_CONFIG.enabled) return null;
  if (!preferencesOpen && consent !== ANALYTICS_CONSENT.unknown) return null;

  return (
    <aside
      aria-labelledby="analytics-consent-heading"
      className="fixed inset-x-3 bottom-3 z-[90] mx-auto max-w-3xl rounded-2xl border border-primary-300 bg-white p-5 text-gray-800 shadow-2xl sm:bottom-5 sm:p-6"
    >
      <h2 id="analytics-consent-heading" className="text-lg font-black text-amazon-dark">
        Your analytics choice
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-700">
        Optional analytics help us understand which pages and conversion steps are useful. Provider
        scripts remain blocked unless you accept. Lead-form details are never included in analytics.
      </p>
      <p className="mt-2 text-xs leading-relaxed text-gray-600">
        Review the current <a href="/cookie-policy" className="font-bold underline underline-offset-2">cookie-policy status</a>.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => setAnalyticsConsent(ANALYTICS_CONSENT.denied)}
          className="rounded-lg border border-gray-400 px-5 py-3 font-extrabold text-gray-800 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
        >
          Decline analytics
        </button>
        <button
          type="button"
          onClick={() => setAnalyticsConsent(ANALYTICS_CONSENT.granted)}
          className="rounded-lg bg-primary-500 px-5 py-3 font-extrabold text-amazon-dark hover:bg-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
        >
          Accept analytics
        </button>
      </div>
    </aside>
  );
};

export default AnalyticsConsentBanner;
