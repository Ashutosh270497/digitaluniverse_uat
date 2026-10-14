import test from 'node:test';
import assert from 'node:assert/strict';
import {
  describeLeadDetails,
  getAdSpendOptions,
  getRevenueShortLabel,
  validateLeadDetailsPayload,
} from '../../shared/leadSchema.js';
import { composeWhatsAppNumber } from '../../src/features/lead-capture/dialCodes.js';

const base = {
  leadId: 'DU-20261014-AB2C',
  name: 'A Seller',
  contactMethod: 'email',
  contact: 'seller@example.com',
  revenueCurrency: 'INR',
};

test('Step 2 accepts any single optional answer and normalises lists', () => {
  for (const answer of [
    { storeUrl: 'amazon.in/stores/YourBrand' },
    { storeUrl: 'B0ABC12345' },
    { marketplaces: ['in', 'in', 'us'] },
    { sellerType: 'vendor' },
    { adSpend: 'not-running' },
    { challenges: ['ppc'] },
    { notes: 'Rankings dropped.' },
  ]) {
    const result = validateLeadDetailsPayload({ ...base, ...answer });
    assert.equal(result.isValid, true, JSON.stringify(answer));
  }
  assert.deepEqual(validateLeadDetailsPayload({ ...base, marketplaces: ['in', 'in', 'us'] }).data.marketplaces, ['in', 'us']);
});

test('Step 2 rejects missing identity, empty submissions and oversized notes', () => {
  assert.ok(validateLeadDetailsPayload({ ...base, contact: 'nope', notes: 'x' }).errors.contact);
  assert.ok(validateLeadDetailsPayload({ ...base, name: '', notes: 'x' }).errors.name);
  assert.equal(validateLeadDetailsPayload(base).errors.details, 'Share at least one detail, or skip this step.');
  assert.ok(validateLeadDetailsPayload({ ...base, notes: 'x'.repeat(1001) }).errors.notes);
  assert.ok(validateLeadDetailsPayload({ ...base, marketplaces: 'in' }).errors.marketplaces);
  assert.ok(validateLeadDetailsPayload({ ...base, sellerType: 'wholesaler' }).errors.sellerType);
});

test('ad spend ranges follow the Step 1 currency', () => {
  assert.deepEqual(getAdSpendOptions('INR').map(option => option.label), [
    'Not running ads yet', 'Under ₹50,000', '₹50,000–₹2,00,000', '₹2,00,000–₹10,00,000', '₹10,00,000+',
  ]);
  assert.deepEqual(getAdSpendOptions('USD').map(option => option.value), ['not-running', 'under-1k', '1k-5k', '5k-20k', '20k-plus']);
  assert.deepEqual(getAdSpendOptions('EUR'), []);
  assert.equal(validateLeadDetailsPayload({ ...base, revenueCurrency: 'USD', adSpend: '50k-2l' }).isValid, false);
});

test('details are described with human-readable labels', () => {
  const { data } = validateLeadDetailsPayload({
    ...base, marketplaces: ['in', 'ae'], sellerType: 'brand-owner', adSpend: '2l-10l', challenges: ['rankings', 'expansion'],
  });
  assert.deepEqual(describeLeadDetails(data), {
    storeUrl: '',
    marketplaces: 'India, UAE',
    sellerType: 'Brand owner',
    adSpend: '₹2,00,000–₹10,00,000',
    challenges: 'Low rankings & visibility, International expansion',
    notes: '',
  });
});

test('revenue bands have compact labels for subject lines', () => {
  assert.equal(getRevenueShortLabel('INR', '1l-5l'), '₹1L–₹5L/mo');
  assert.equal(getRevenueShortLabel('USD', 'under-10k'), 'Under $10K/mo');
  assert.equal(getRevenueShortLabel('GBP', '200k-plus'), '£200K+/mo');
  assert.equal(getRevenueShortLabel('USD', 'not-selling-yet'), 'Not selling yet');
  assert.equal(getRevenueShortLabel('USD', '1l-5l'), '');
});

test('the WhatsApp number joins the country code unless the visitor typed their own', () => {
  assert.equal(composeWhatsAppNumber('+91', '97924 20796'), '+91 97924 20796');
  assert.equal(composeWhatsAppNumber('+44', '07700 900123'), '+44 7700 900123');
  assert.equal(composeWhatsAppNumber('+91', '+971 50 123 4567'), '+971 50 123 4567');
  assert.equal(composeWhatsAppNumber('', '+971501234567'), '+971501234567');
  assert.equal(composeWhatsAppNumber('+91', '  '), '');
});
