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

// Compact band for subject lines and badges, e.g. "₹1L–₹5L/mo".
export const getRevenueShortLabel = (currencyCode, value) => {
  if (value === 'not-selling-yet') return 'Not selling yet';
  const currency = REVENUE_CURRENCIES.find(item => item.code === currencyCode);
  const range = currency && revenueRanges[currency.code].find(([rangeValue]) => rangeValue === value);
  if (!range) return '';
  const money = new Intl.NumberFormat(currency.locale, { style: 'currency', currency: currency.code, notation: 'compact', maximumFractionDigits: 0 });
  const [, min, max] = range;
  if (min === null) return `Under ${money.format(max)}/mo`;
  return max === null ? `${money.format(min)}+/mo` : `${money.format(min)}–${money.format(max)}/mo`;
};

export const MARKETPLACES = Object.freeze([
  Object.freeze({ value: 'in', label: 'India', flag: '🇮🇳' }),
  Object.freeze({ value: 'us', label: 'United States', flag: '🇺🇸' }),
  Object.freeze({ value: 'uk', label: 'United Kingdom', flag: '🇬🇧' }),
  Object.freeze({ value: 'ae', label: 'UAE', flag: '🇦🇪' }),
  Object.freeze({ value: 'eu', label: 'Europe', flag: '🇪🇺' }),
  Object.freeze({ value: 'other', label: 'Other', flag: '🌍' }),
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

const validateIdentity = (data) => {
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

  return errors;
};

export const validateLeadPayload = (payload = {}, { requireMonthlyRevenue = true } = {}) => {
  const data = {
    name: asTrimmedString(payload.name),
    contactMethod: asTrimmedString(payload.contactMethod),
    contact: asTrimmedString(payload.contact),
    revenueCurrency: asTrimmedString(payload.revenueCurrency),
    monthlyRevenue: asTrimmedString(payload.monthlyRevenue),
  };
  const errors = validateIdentity(data);

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
  const data = {
    leadId: asTrimmedString(payload.leadId),
    name: asTrimmedString(payload.name),
    contactMethod: asTrimmedString(payload.contactMethod),
    contact: asTrimmedString(payload.contact),
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
  Object.assign(errors, validateIdentity(data));

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
  marketplaces: data.marketplaces.map(value => labelFor(MARKETPLACES, value)).filter(Boolean).join(', '),
  sellerType: labelFor(SELLER_TYPES, data.sellerType),
  adSpend: data.adSpend ? labelFor(getAdSpendOptions(data.revenueCurrency), data.adSpend) : '',
  challenges: data.challenges.map(value => labelFor(CHALLENGES, value)).filter(Boolean).join(', '),
  notes: data.notes,
});
