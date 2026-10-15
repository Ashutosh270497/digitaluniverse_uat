import { LEAD_ID_PATTERN } from '../../../shared/leadSchema.js';

// The confirmed lead travels to /thank-you in this tab's sessionStorage, never in the URL.
const STORAGE_KEY = 'du:audit-request';
const MAX_AGE_MS = 12 * 60 * 60 * 1000;

const getStorage = () => {
  try {
    return globalThis.sessionStorage ?? null;
  } catch {
    return null;
  }
};

export const saveThankYouHandoff = (lead, { storage = getStorage(), now = Date.now() } = {}) => {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify({ ...lead, savedAt: now }));
    return Boolean(storage);
  } catch {
    return false;
  }
};

export const readThankYouHandoff = ({ storage = getStorage(), now = Date.now() } = {}) => {
  try {
    const lead = JSON.parse(storage?.getItem(STORAGE_KEY) ?? 'null');
    if (!lead || typeof lead.name !== 'string' || !lead.name.trim()) return null;
    if (typeof lead.savedAt !== 'number' || now - lead.savedAt > MAX_AGE_MS) return null;
    return {
      name: lead.name,
      email: typeof lead.email === 'string' ? lead.email : '',
      whatsapp: typeof lead.whatsapp === 'string' ? lead.whatsapp : '',
      leadId: LEAD_ID_PATTERN.test(lead.leadId ?? '') ? lead.leadId : '',
      revenueCurrency: typeof lead.revenueCurrency === 'string' ? lead.revenueCurrency : 'USD',
      revenueLabel: typeof lead.revenueLabel === 'string' ? lead.revenueLabel : '',
      formLocation: typeof lead.formLocation === 'string' ? lead.formLocation : 'unspecified',
    };
  } catch {
    return null;
  }
};
