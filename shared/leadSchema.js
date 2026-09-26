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

export const getMonthlyRevenueOptions = (currencyCode) => {
  const currency = REVENUE_CURRENCIES.find(item => item.code === currencyCode);
  if (!currency) return [];
  const money = new Intl.NumberFormat(currency.locale, { style: 'currency', currency: currency.code, maximumFractionDigits: 0 });
  return [
    { value: 'not-selling-yet', label: 'Not selling on Amazon yet' },
    ...revenueRanges[currency.code].map(([value, min, max]) => ({
      value,
      label: min === null ? `Under ${money.format(max)}` : max === null ? `${money.format(min)}+` : `${money.format(min)}–${money.format(max)}`,
    })),
  ];
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const whatsappPattern = /^\+?[1-9]\d{7,14}$/;
const asTrimmedString = (value) => (typeof value === 'string' ? value.trim() : '');

export const validateLeadPayload = (payload = {}, { requireMonthlyRevenue = true } = {}) => {
  const data = {
    name: asTrimmedString(payload.name),
    contactMethod: asTrimmedString(payload.contactMethod),
    contact: asTrimmedString(payload.contact),
    revenueCurrency: asTrimmedString(payload.revenueCurrency),
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
