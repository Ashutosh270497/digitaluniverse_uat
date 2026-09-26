import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONTACT_METHODS,
  validateLeadPayload,
  getMonthlyRevenueOptions,
} from '../../shared/leadSchema.js';

const validLead = {
  name: 'A Seller',
  contactMethod: CONTACT_METHODS.email,
  contact: 'seller@example.com',
  revenueCurrency: 'USD',
  monthlyRevenue: '10k-50k',
};

test('empty submission is rejected with accessible field errors', () => {
  const result = validateLeadPayload({});

  assert.equal(result.isValid, false);
  assert.deepEqual(Object.keys(result.errors).sort(), [
    'contact',
    'monthlyRevenue',
    'name',
    'revenueCurrency',
  ]);
});

test('invalid email is rejected', () => {
  const result = validateLeadPayload({ ...validLead, contact: 'not-an-email' });

  assert.equal(result.isValid, false);
  assert.equal(result.errors.contact, 'Enter a valid work email.');
});

test('currency must be explicitly selected and supported', () => {
  for (const revenueCurrency of ['', 'EUR', '__proto__']) {
    const result = validateLeadPayload({ ...validLead, revenueCurrency });
    assert.equal(result.isValid, false);
    assert.ok(result.errors.revenueCurrency);
  }
});

test('revenue ranges are validated in their selected currency', () => {
  for (const [revenueCurrency, monthlyRevenue, label] of [
    ['USD', '10k-50k', '$10,000–$50,000'],
    ['INR', '1l-5l', '₹1,00,000–₹5,00,000'],
    ['GBP', '10k-50k', '£10,000–£50,000'],
  ]) {
    assert.equal(validateLeadPayload({ ...validLead, revenueCurrency, monthlyRevenue }).isValid, true);
    assert.equal(getMonthlyRevenueOptions(revenueCurrency).find(option => option.value === monthlyRevenue).label, label);
    assert.equal(validateLeadPayload({ ...validLead, revenueCurrency, monthlyRevenue: 'not-selling-yet' }).isValid, true);
  }
  assert.equal(validateLeadPayload({ ...validLead, revenueCurrency: 'INR' }).isValid, false);
  assert.equal(validateLeadPayload({ ...validLead, monthlyRevenue: '1l-5l' }).isValid, false);
  assert.deepEqual(getMonthlyRevenueOptions('EUR'), []);
});

test('Amazon URL is no longer required or included in normalized lead data', () => {
  const result = validateLeadPayload({ ...validLead, amazonUrl: 'https://example.com/retired-field' });
  assert.equal(result.isValid, true);
  assert.equal('amazonUrl' in result.data, false);
});

test('valid WhatsApp contact uses a telephone-compatible value', () => {
  const result = validateLeadPayload({
    ...validLead,
    contactMethod: CONTACT_METHODS.whatsapp,
    contact: '+91 98765 43210',
  });

  assert.equal(result.isValid, true);
});

test('revenue may be omitted only when the caller explicitly selects the experiment policy', () => {
  const withoutRevenue = { ...validLead, monthlyRevenue: '' };

  assert.equal(validateLeadPayload(withoutRevenue).isValid, false);
  assert.equal(
    validateLeadPayload(withoutRevenue, { requireMonthlyRevenue: false }).isValid,
    true,
  );
  assert.equal(
    validateLeadPayload(
      { ...withoutRevenue, monthlyRevenue: 'invented-range' },
      { requireMonthlyRevenue: false },
    ).isValid,
    false,
  );
});
