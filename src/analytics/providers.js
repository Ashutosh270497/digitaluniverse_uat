const appendProviderScript = ({ documentObject, id, src }) => {
  if (!documentObject?.createElement || !documentObject?.head) return false;
  if (documentObject.getElementById?.(id)) return true;

  const script = documentObject.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  script.dataset.analyticsProvider = id;
  documentObject.head.appendChild(script);
  return true;
};

const grantedConsent = Object.freeze({
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'granted',
});

const deniedConsent = Object.freeze({
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
});

export const createGa4Provider = ({ measurementId, windowObject, documentObject }) => ({
  name: 'ga4',
  load() {
    windowObject.dataLayer = windowObject.dataLayer ?? [];
    windowObject.gtag = windowObject.gtag ?? function gtag() {
      windowObject.dataLayer.push(arguments);
    };
    windowObject.gtag('consent', 'default', grantedConsent);
    windowObject.gtag('js', new Date());
    windowObject.gtag('config', measurementId, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    });

    return appendProviderScript({
      documentObject,
      id: 'analytics-provider-ga4',
      src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`,
    });
  },
  updateConsent(consent) {
    windowObject.gtag?.(
      'consent',
      'update',
      consent === 'granted' ? grantedConsent : deniedConsent,
    );
  },
  dispatch({ name, params }) {
    const eventParams = { ...params, send_to: measurementId };
    if (name === 'page_view') {
      eventParams.page_location = `${windowObject.location?.origin ?? ''}${params.page_path}`;
    }
    windowObject.gtag?.('event', name, eventParams);
  },
});

export const createClarityProvider = ({ projectId, windowObject, documentObject }) => ({
  name: 'clarity',
  load() {
    windowObject.clarity = windowObject.clarity ?? function clarity() {
      windowObject.clarity.q = windowObject.clarity.q ?? [];
      windowObject.clarity.q.push(arguments);
    };
    windowObject.clarity('consentv2', {
      ad_Storage: 'denied',
      analytics_Storage: 'granted',
    });

    return appendProviderScript({
      documentObject,
      id: 'analytics-provider-clarity',
      src: `https://www.clarity.ms/tag/${encodeURIComponent(projectId)}`,
    });
  },
  updateConsent(consent) {
    windowObject.clarity?.('consentv2', {
      ad_Storage: 'denied',
      analytics_Storage: consent === 'granted' ? 'granted' : 'denied',
    });
    if (consent === 'denied') windowObject.clarity?.('consent', false);
  },
  dispatch({ name, params }) {
    for (const [key, value] of Object.entries(params)) {
      windowObject.clarity?.('set', key, Array.isArray(value) ? value : String(value));
    }
    windowObject.clarity?.('event', name);
  },
});

export const createMetaProvider = ({ pixelId, windowObject, documentObject }) => ({
  name: 'meta',
  load() {
    if (!windowObject.fbq) {
      const fbq = function metaPixelQueue() {
        if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments);
        else fbq.queue.push(arguments);
      };
      fbq.push = fbq;
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.queue = [];
      windowObject.fbq = fbq;
      windowObject._fbq = fbq;
    }

    windowObject.fbq('consent', 'grant');
    windowObject.fbq('set', 'autoConfig', false, pixelId);
    windowObject.fbq('init', pixelId);
    return appendProviderScript({
      documentObject,
      id: 'analytics-provider-meta',
      src: 'https://connect.facebook.net/en_US/fbevents.js',
    });
  },
  updateConsent(consent) {
    windowObject.fbq?.('consent', consent === 'granted' ? 'grant' : 'revoke');
  },
  dispatch({ name, params }) {
    if (name === 'page_view') windowObject.fbq?.('track', 'PageView', params);
    else windowObject.fbq?.('trackCustom', name, params);
  },
});

export const createLinkedInProvider = ({
  partnerId,
  conversionIds,
  windowObject,
  documentObject,
}) => ({
  name: 'linkedin',
  load() {
    windowObject._linkedin_partner_id = partnerId;
    windowObject._linkedin_data_partner_ids = windowObject._linkedin_data_partner_ids ?? [];
    if (!windowObject._linkedin_data_partner_ids.includes(partnerId)) {
      windowObject._linkedin_data_partner_ids.push(partnerId);
    }
    if (!windowObject.lintrk) {
      windowObject.lintrk = function linkedinQueue(action, payload) {
        windowObject.lintrk.q.push([action, payload]);
      };
      windowObject.lintrk.q = [];
    }

    return appendProviderScript({
      documentObject,
      id: 'analytics-provider-linkedin',
      src: 'https://snap.licdn.com/li.lms-analytics/insight.min.js',
    });
  },
  updateConsent() {},
  dispatch({ name, eventId }) {
    const conversionId = conversionIds[name];
    if (!conversionId) return;
    windowObject.lintrk?.('track', {
      conversion_id: Number(conversionId),
      event_id: eventId,
    });
  },
});

export const createConfiguredProviders = ({ config, windowObject, documentObject }) => {
  if (!windowObject || !documentObject) return [];

  const providers = [];
  if (config.ga4.measurementId) {
    providers.push(createGa4Provider({
      measurementId: config.ga4.measurementId,
      windowObject,
      documentObject,
    }));
  }
  if (config.clarity.projectId) {
    providers.push(createClarityProvider({
      projectId: config.clarity.projectId,
      windowObject,
      documentObject,
    }));
  }
  if (config.meta.pixelId) {
    providers.push(createMetaProvider({
      pixelId: config.meta.pixelId,
      windowObject,
      documentObject,
    }));
  }
  if (config.linkedin.partnerId) {
    providers.push(createLinkedInProvider({
      partnerId: config.linkedin.partnerId,
      conversionIds: config.linkedin.conversionIds,
      windowObject,
      documentObject,
    }));
  }

  return providers;
};
