export const CONTACT_METHODS = Object.freeze({
  email: 'email',
  whatsapp: 'whatsapp',
});

export const MONTHLY_REVENUE_OPTIONS = Object.freeze([
  Object.freeze({ value: 'not-selling-yet', label: 'Not selling on Amazon yet' }),
  Object.freeze({ value: 'under-10k', label: 'Under US$10,000' }),
  Object.freeze({ value: '10k-50k', label: 'US$10,000–US$50,000' }),
  Object.freeze({ value: '50k-200k', label: 'US$50,000–US$200,000' }),
  Object.freeze({ value: '200k-plus', label: 'US$200,000+' }),
]);

const revenueValues = new Set(MONTHLY_REVENUE_OPTIONS.map((option) => option.value));
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const whatsappPattern = /^\+?[1-9]\d{7,14}$/;
const amazonMarketplaceDomains = [
  'amazon.ae',
  'amazon.ca',
  'amazon.cn',
  'amazon.co.jp',
  'amazon.co.uk',
  'amazon.co.za',
  'amazon.com',
  'amazon.com.au',
  'amazon.com.be',
  'amazon.com.br',
  'amazon.com.mx',
  'amazon.com.tr',
  'amazon.de',
  'amazon.eg',
  'amazon.es',
  'amazon.fr',
  'amazon.ie',
  'amazon.in',
  'amazon.it',
  'amazon.nl',
  'amazon.pl',
  'amazon.sa',
  'amazon.se',
  'amazon.sg',
];

const asTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');

export const isAmazonUrl = (value) => {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const isAmazonHost = amazonMarketplaceDomains.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    ) || hostname === 'amzn.to';

    return value.length <= 2_048 && url.protocol === 'https:' && isAmazonHost && url.pathname.length > 1;
  } catch {
    return false;
  }
};

export const validateLeadPayload = (payload = {}, { requireMonthlyRevenue = true } = {}) => {
  const data = {
    name: asTrimmedString(payload.name),
    contactMethod: asTrimmedString(payload.contactMethod),
    contact: asTrimmedString(payload.contact),
    amazonUrl: asTrimmedString(payload.amazonUrl),
    monthlyRevenue: asTrimmedString(payload.monthlyRevenue),
  };
  const errors = {};

  if (!data.name) {
    errors.name = 'Enter your name.';
  } else if (data.name.length > 100) {
    errors.name = 'Name must be 100 characters or fewer.';
  }

  if (!data.contact) {
    errors.contact = data.contactMethod === CONTACT_METHODS.whatsapp
      ? 'Enter your WhatsApp number.'
      : 'Enter your work email.';
  } else if (
    data.contactMethod === CONTACT_METHODS.email &&
    (data.contact.length > 254 || !emailPattern.test(data.contact))
  ) {
    errors.contact = 'Enter a valid work email.';
  } else if (
    data.contactMethod === CONTACT_METHODS.whatsapp &&
    !whatsappPattern.test(data.contact.replace(/[\s()-]/g, ''))
  ) {
    errors.contact = 'Enter a valid WhatsApp number including country code.';
  } else if (!Object.values(CONTACT_METHODS).includes(data.contactMethod)) {
    errors.contact = 'Choose email or WhatsApp as your contact method.';
  }

  if (!data.amazonUrl) {
    errors.amazonUrl = 'Enter your Amazon store or ASIN URL.';
  } else if (!isAmazonUrl(data.amazonUrl)) {
    errors.amazonUrl = 'Enter a valid HTTPS Amazon store or ASIN URL.';
  }

  if (requireMonthlyRevenue && !revenueValues.has(data.monthlyRevenue)) {
    errors.monthlyRevenue = 'Select your monthly Amazon revenue range.';
  } else if (data.monthlyRevenue && !revenueValues.has(data.monthlyRevenue)) {
    errors.monthlyRevenue = 'Select a valid monthly Amazon revenue range.';
  }

  return {
    data,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};
