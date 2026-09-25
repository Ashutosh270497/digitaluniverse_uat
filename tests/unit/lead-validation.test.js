import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONTACT_METHODS,
  validateLeadPayload,
} from '../../shared/leadSchema.js';

const validLead = {
  name: 'A Seller',
  contactMethod: CONTACT_METHODS.email,
  contact: 'seller@example.com',
  amazonUrl: 'https://www.amazon.in/dp/B0EXAMPLE1',
  monthlyRevenue: '10k-50k',
};

test('empty submission is rejected with accessible field errors', () => {
  const result = validateLeadPayload({});

  assert.equal(result.isValid, false);
  assert.deepEqual(Object.keys(result.errors).sort(), [
    'amazonUrl',
    'contact',
    'monthlyRevenue',
    'name',
  ]);
});

test('invalid email is rejected', () => {
  const result = validateLeadPayload({ ...validLead, contact: 'not-an-email' });

  assert.equal(result.isValid, false);
  assert.equal(result.errors.contact, 'Enter a valid work email.');
});

test('invalid Amazon URL is rejected', () => {
  const result = validateLeadPayload({
    ...validLead,
    amazonUrl: 'https://example.com/dp/B0EXAMPLE1',
  });

  assert.equal(result.isValid, false);
  assert.equal(result.errors.amazonUrl, 'Enter a valid HTTPS Amazon store or ASIN URL.');
});

test('Amazon lookalike hostname is rejected', () => {
  const result = validateLeadPayload({
    ...validLead,
    amazonUrl: 'https://amazon.example/dp/B0EXAMPLE1',
  });

  assert.equal(result.isValid, false);
  assert.equal(result.errors.amazonUrl, 'Enter a valid HTTPS Amazon store or ASIN URL.');
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
