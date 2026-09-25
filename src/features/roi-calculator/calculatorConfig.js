export const CALCULATOR_CURRENCIES = Object.freeze([
  { key: 'USD', label: 'Dollar', symbol: '$', locale: 'en-US', revenue: { max: 500_000, initial: 50_000 }, adSpend: { max: 100_000, initial: 5_000 } },
  { key: 'INR', label: 'INR', symbol: '₹', locale: 'en-IN', revenue: { max: 50_000_000, initial: 4_000_000 }, adSpend: { max: 10_000_000, initial: 400_000 } },
  { key: 'GBP', label: 'Pound', symbol: '£', locale: 'en-GB', revenue: { max: 500_000, initial: 40_000 }, adSpend: { max: 100_000, initial: 4_000 } },
]);

export const CALCULATOR_PERIODS = Object.freeze([
  { months: 12, label: '1 Year' },
  { months: 24, label: '2 Years' },
  { months: 36, label: '3 Years' },
]);

export const formatScenarioMoney = (value, currency) => new Intl.NumberFormat(currency.locale, {
  style: 'currency', currency: currency.key, minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2,
}).format(value);

export const formatPeriod = months => months % 12 === 0
  ? `${months / 12} ${months === 12 ? 'year' : 'years'}`
  : `${months} ${months === 1 ? 'month' : 'months'}`;
