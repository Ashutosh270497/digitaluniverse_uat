const asHttpsUrl = (value) => {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
};

const configuredLeadApiUrl = import.meta.env.VITE_LEAD_API_URL?.trim();

export const LEAD_FUNNEL_CONFIG = Object.freeze({
  apiUrl: configuredLeadApiUrl || '/api/leads',
  bookingCalendarUrl: asHttpsUrl(import.meta.env.VITE_BOOKING_CALENDAR_URL?.trim()),
});
