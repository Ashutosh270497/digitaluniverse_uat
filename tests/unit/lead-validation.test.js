import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONTACT_METHODS,
  validateLeadPayload,
  getMonthlyRevenueOptions,
} from '../../shared/leadSchema.js';

const validLead = {
  name: 'A Seller',
  email: 'seller@example.com',
  whatsapp: '+91 98765 43210',
  revenueCurrency: 'USD',
  monthlyRevenue: '10k-50k',
};

test('empty submission is rejected with accessible field errors', () => {
  const result = validateLeadPayload({});

  assert.equal(result.isValid, false);
  assert.deepEqual(Object.keys(result.errors).sort(), [
    'email',
    'monthlyRevenue',
    'name',
    'revenueCurrency',
    'whatsapp',
  ]);
});

test('invalid email is rejected', () => {
  const result = validateLeadPayload({ ...validLead, email: 'not-an-email' });

  assert.equal(result.isValid, false);
  assert.equal(result.errors.email, 'Enter a valid email address, for example you@yourbrand.com.');
});

test('email and WhatsApp are both required', () => {
  const withoutWhatsApp = validateLeadPayload({ ...validLead, whatsapp: '' });
  const withoutEmail = validateLeadPayload({ ...validLead, email: '' });

  assert.equal(withoutWhatsApp.isValid, false);
  assert.equal(withoutWhatsApp.errors.whatsapp, 'Enter your WhatsApp number, including the country code.');
  assert.equal(withoutEmail.isValid, false);
  assert.equal(withoutEmail.errors.email, 'Enter your email address.');
  assert.ok(validateLeadPayload({ ...validLead, whatsapp: '12' }).errors.whatsapp);
});

test('valid leads keep both contacts in normalized data', () => {
  const result = validateLeadPayload({ ...validLead, email: ' seller@example.com ' });

  assert.equal(result.isValid, true);
  assert.equal(result.data.email, 'seller@example.com');
  assert.equal(result.data.whatsapp, '+91 98765 43210');
  assert.equal('contact' in result.data, false);
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

test('legacy single-contact payloads from cached pages are still accepted', () => {
  const { email, whatsapp, ...legacyBase } = validLead;
  const viaEmail = validateLeadPayload({ ...legacyBase, contactMethod: CONTACT_METHODS.email, contact: email });
  const viaWhatsApp = validateLeadPayload({ ...legacyBase, contactMethod: CONTACT_METHODS.whatsapp, contact: whatsapp });

  assert.equal(viaEmail.isValid, true);
  assert.deepEqual([viaEmail.data.email, viaEmail.data.whatsapp], ['seller@example.com', '']);
  assert.equal(viaWhatsApp.isValid, true);
  assert.deepEqual([viaWhatsApp.data.email, viaWhatsApp.data.whatsapp], ['', '+91 98765 43210']);
  assert.ok(validateLeadPayload({ ...legacyBase, contactMethod: CONTACT_METHODS.email, contact: 'nope' }).errors.email);
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
