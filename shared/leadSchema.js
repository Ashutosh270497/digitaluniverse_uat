export const CONTACT_METHODS = Object.freeze({
  email: 'email',
  whatsapp: 'whatsapp',
});

export const REVENUE_CURRENCIES = Object.freeze([
  Object.freeze({ code: 'USD', symbol: '$', label: 'US Dollar', locale: 'en-US' }),
  Object.freeze({ code: 'INR', symbol: '₹', label: 'Indian Rupee', locale: 'en-IN' }),
  Object.freeze({ code: 'GBP', symbol: '£', label: 'British Pound', locale: 'en-GB' }),
]);

// These are local-currency qualification bands, not exchange-rate conversions.
const revenueRanges = {
  USD: [['under-10k', null, 10000], ['10k-50k', 10000, 50000], ['50k-200k', 50000, 200000], ['200k-plus', 200000, null]],
  INR: [['under-1l', null, 100000], ['1l-5l', 100000, 500000], ['5l-20l', 500000, 2000000], ['20l-plus', 2000000, null]],
  GBP: [['under-10k', null, 10000], ['10k-50k', 10000, 50000], ['50k-200k', 50000, 200000], ['200k-plus', 200000, null]],
};

const adSpendRanges = {
  USD: [['under-1k', null, 1000], ['1k-5k', 1000, 5000], ['5k-20k', 5000, 20000], ['20k-plus', 20000, null]],
  INR: [['under-50k', null, 50000], ['50k-2l', 50000, 200000], ['2l-10l', 200000, 1000000], ['10l-plus', 1000000, null]],
  GBP: [['under-1k', null, 1000], ['1k-5k', 1000, 5000], ['5k-20k', 5000, 20000], ['20k-plus', 20000, null]],
};

const formatRangeOptions = (currencyCode, ranges, firstOption) => {
  const currency = REVENUE_CURRENCIES.find(item => item.code === currencyCode);
  if (!currency) return [];
  const money = new Intl.NumberFormat(currency.locale, { style: 'currency', currency: currency.code, maximumFractionDigits: 0 });
  return [
    firstOption,
    ...ranges[currency.code].map(([value, min, max]) => ({
      value,
      label: min === null ? `Under ${money.format(max)}` : max === null ? `${money.format(min)}+` : `${money.format(min)}–${money.format(max)}`,
    })),
  ];
};

export const getMonthlyRevenueOptions = (currencyCode) =>
  formatRangeOptions(currencyCode, revenueRanges, { value: 'not-selling-yet', label: 'Not selling on Amazon yet' });

export const getAdSpendOptions = (currencyCode) =>
  formatRangeOptions(currencyCode, adSpendRanges, { value: 'not-running', label: 'Not running ads yet' });

// Fixed suffixes rather than Intl's compact notation, whose casing varies between ICU versions.
const compactMoney = (currency, amount) => {
  const units = currency.code === 'INR'
    ? [[10_000_000, 'Cr'], [100_000, 'L'], [1_000, 'K']]
    : [[1_000_000, 'M'], [1_000, 'K']];
  const [divisor, suffix] = units.find(([size]) => amount >= size) ?? [1, ''];
  return `${currency.symbol}${amount / divisor}${suffix}`;
};

// Compact band for subject lines and badges, e.g. "₹1L–₹5L/mo".
export const getRevenueShortLabel = (currencyCode, value) => {
  if (value === 'not-selling-yet') return 'Not selling yet';
  const currency = REVENUE_CURRENCIES.find(item => item.code === currencyCode);
  const range = currency && revenueRanges[currency.code].find(([rangeValue]) => rangeValue === value);
  if (!range) return '';
  const [, min, max] = range;
  if (min === null) return `Under ${compactMoney(currency, max)}/mo`;
  return max === null ? `${compactMoney(currency, min)}+/mo` : `${compactMoney(currency, min)}–${compactMoney(currency, max)}/mo`;
};

export const MARKETPLACE_GROUPS = Object.freeze([
  Object.freeze({ id: 'amazon', label: 'Amazon' }),
  Object.freeze({ id: 'other', label: 'Other marketplaces' }),
]);

// `summaryLabel` names the platform in emails and the confirmation summary.
export const MARKETPLACES = Object.freeze([
  Object.freeze({ value: 'in', label: 'India', flag: '🇮🇳', group: 'amazon', summaryLabel: 'Amazon India' }),
  Object.freeze({ value: 'us', label: 'United States', flag: '🇺🇸', group: 'amazon', summaryLabel: 'Amazon US' }),
  Object.freeze({ value: 'uk', label: 'United Kingdom', flag: '🇬🇧', group: 'amazon', summaryLabel: 'Amazon UK' }),
  Object.freeze({ value: 'ae', label: 'UAE', flag: '🇦🇪', group: 'amazon', summaryLabel: 'Amazon UAE' }),
  Object.freeze({ value: 'eu', label: 'Europe', flag: '🇪🇺', group: 'amazon', summaryLabel: 'Amazon Europe' }),
  Object.freeze({ value: 'flipkart', label: 'Flipkart', group: 'other', summaryLabel: 'Flipkart' }),
  Object.freeze({ value: 'meesho', label: 'Meesho', group: 'other', summaryLabel: 'Meesho' }),
  Object.freeze({ value: 'tiktok-shop', label: 'TikTok Shop', group: 'other', summaryLabel: 'TikTok Shop' }),
  Object.freeze({ value: 'other', label: 'Other', flag: '🌍', group: 'other', summaryLabel: 'Other marketplace' }),
]);

export const SELLER_TYPES = Object.freeze([
  Object.freeze({ value: 'brand-owner', label: 'Brand owner' }),
  Object.freeze({ value: 'reseller', label: 'Reseller' }),
  Object.freeze({ value: 'vendor', label: 'Vendor (1P)' }),
]);

export const CHALLENGES = Object.freeze([
  Object.freeze({ value: 'ppc', label: 'High ACoS / PPC waste' }),
  Object.freeze({ value: 'rankings', label: 'Low rankings & visibility' }),
  Object.freeze({ value: 'conversion', label: 'Listing conversion' }),
  Object.freeze({ value: 'account-health', label: 'Account health' }),
  Object.freeze({ value: 'launches', label: 'Launching new products' }),
  Object.freeze({ value: 'expansion', label: 'International expansion' }),
]);

export const LEAD_ID_PATTERN = /^DU-\d{8}-[A-Z0-9]{4}$/;
export const DETAILS_LIMITS = Object.freeze({ storeUrl: 300, notes: 1000 });

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const whatsappPattern = /^\+?[1-9]\d{7,14}$/;
const asinPattern = /^[A-Z0-9]{10}$/i;
const asTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');
const asValueList = (value) => (Array.isArray(value)
  ? [...new Set(value.filter((item) => typeof item === 'string'))]
  : null);

// Leads give both an email and a WhatsApp number. Pages loaded before that change send one
// contactMethod/contact pair; it is mapped here and accepted with a single contact for now.
export const normalizeContactFields = (payload = {}) => {
  const email = asTrimmedString(payload.email);
  const whatsapp = asTrimmedString(payload.whatsapp);
  if (email || whatsapp || !payload.contactMethod) return { email, whatsapp, legacy: false };
  const contact = asTrimmedString(payload.contact);
  return payload.contactMethod === CONTACT_METHODS.whatsapp
    ? { email: '', whatsapp: contact, legacy: true }
    : { email: contact, whatsapp: '', legacy: true };
};

const validateIdentity = (data, { legacy = false } = {}) => {
  const errors = {};

  if (!data.name) {
    errors.name = 'Enter your name.';
  } else if (data.name.length > 100) {
    errors.name = 'Name must be 100 characters or fewer.';
  }

  const singleContactOk = legacy && Boolean(data.email || data.whatsapp);

  if (!data.email) {
    if (!singleContactOk) errors.email = 'Enter your email address.';
  } else if (data.email.length > 254 || !emailPattern.test(data.email)) {
    errors.email = 'Enter a valid email address, for example you@yourbrand.com.';
  }

  if (!data.whatsapp) {
    if (!singleContactOk) errors.whatsapp = 'Enter your WhatsApp number, including the country code.';
  } else if (!whatsappPattern.test(data.whatsapp.replace(/[\s()-]/g, ''))) {
    errors.whatsapp = 'Enter a valid WhatsApp number, including the country code.';
  }

  return errors;
};

export const validateLeadPayload = (payload = {}, { requireMonthlyRevenue = true } = {}) => {
  const contacts = normalizeContactFields(payload);
  const data = {
    name: asTrimmedString(payload.name),
    email: contacts.email,
    whatsapp: contacts.whatsapp,
    revenueCurrency: asTrimmedString(payload.revenueCurrency),
    monthlyRevenue: asTrimmedString(payload.monthlyRevenue),
  };
  const errors = validateIdentity(data, { legacy: contacts.legacy });

  const currencyIsValid = REVENUE_CURRENCIES.some(currency => currency.code === data.revenueCurrency);
  if ((requireMonthlyRevenue || data.monthlyRevenue || data.revenueCurrency) && !currencyIsValid) {
    errors.revenueCurrency = 'Choose USD, INR or GBP for your revenue range.';
  }

  if (requireMonthlyRevenue && !data.monthlyRevenue) {
    errors.monthlyRevenue = 'Select your monthly Amazon revenue range.';
  } else if (data.monthlyRevenue && currencyIsValid && !getMonthlyRevenueOptions(data.revenueCurrency).some(option => option.value === data.monthlyRevenue)) {
    errors.monthlyRevenue = 'Select a valid revenue range for your chosen currency.';
  }

  return {
    data,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

// Step 2 is optional, but a submission must carry the lead it belongs to and at least one answer.
export const validateLeadDetailsPayload = (payload = {}) => {
  const contacts = normalizeContactFields(payload);
  const data = {
    leadId: asTrimmedString(payload.leadId),
    name: asTrimmedString(payload.name),
    email: contacts.email,
    whatsapp: contacts.whatsapp,
    revenueCurrency: asTrimmedString(payload.revenueCurrency),
    storeUrl: asTrimmedString(payload.storeUrl),
    marketplaces: asValueList(payload.marketplaces) ?? [],
    sellerType: asTrimmedString(payload.sellerType),
    adSpend: asTrimmedString(payload.adSpend),
    challenges: asValueList(payload.challenges) ?? [],
    notes: asTrimmedString(payload.notes),
  };
  const errors = {};

  if (!LEAD_ID_PATTERN.test(data.leadId)) errors.leadId = 'This audit request could not be matched. Please submit the form again.';
  Object.assign(errors, validateIdentity(data, { legacy: contacts.legacy }));

  if (data.storeUrl.length > DETAILS_LIMITS.storeUrl) {
    errors.storeUrl = `Keep the store link under ${DETAILS_LIMITS.storeUrl} characters.`;
  } else if (data.storeUrl && !asinPattern.test(data.storeUrl) && (/\s/.test(data.storeUrl) || !data.storeUrl.includes('.'))) {
    errors.storeUrl = 'Enter a store link, product link or 10-character ASIN.';
  }

  if (payload.marketplaces !== undefined && (!Array.isArray(payload.marketplaces)
    || data.marketplaces.some(value => !MARKETPLACES.some(item => item.value === value)))) {
    errors.marketplaces = 'Choose marketplaces from the list.';
  }

  if (data.sellerType && !SELLER_TYPES.some(item => item.value === data.sellerType)) {
    errors.sellerType = 'Choose one of the listed seller types.';
  }

  if (data.adSpend) {
    const currencyIsValid = REVENUE_CURRENCIES.some(currency => currency.code === data.revenueCurrency);
    if (!currencyIsValid || !getAdSpendOptions(data.revenueCurrency).some(option => option.value === data.adSpend)) {
      errors.adSpend = 'Select a valid ad spend range.';
    }
  }

  if (payload.challenges !== undefined && (!Array.isArray(payload.challenges)
    || data.challenges.some(value => !CHALLENGES.some(item => item.value === value)))) {
    errors.challenges = 'Choose challenges from the list.';
  }

  if (data.notes.length > DETAILS_LIMITS.notes) {
    errors.notes = `Keep notes under ${DETAILS_LIMITS.notes} characters.`;
  }

  const hasAnswer = Boolean(data.storeUrl || data.marketplaces.length || data.sellerType
    || data.adSpend || data.challenges.length || data.notes);
  if (!hasAnswer && Object.keys(errors).length === 0) {
    errors.details = 'Share at least one detail, or skip this step.';
  }

  return {
    data,
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};

const labelFor = (list, value) => list.find(item => item.value === value)?.label ?? '';

// Human-readable answers for emails and the confirmation summary.
export const describeLeadDetails = (data) => ({
  storeUrl: data.storeUrl,
  marketplaces: data.marketplaces
    .map(value => MARKETPLACES.find(item => item.value === value)?.summaryLabel ?? '')
    .filter(Boolean)
    .join(', '),
  sellerType: labelFor(SELLER_TYPES, data.sellerType),
  adSpend: data.adSpend ? labelFor(getAdSpendOptions(data.revenueCurrency), data.adSpend) : '',
  challenges: data.challenges.map(value => labelFor(CHALLENGES, value)).filter(Boolean).join(', '),
  notes: data.notes,
});
