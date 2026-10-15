import test from 'node:test';
import assert from 'node:assert/strict';
import { readThankYouHandoff, saveThankYouHandoff } from '../../src/features/lead-capture/thankYouHandoff.js';

const createStorage = () => {
  const values = new Map();
  return {
    values,
    getItem: (key) => (values.has(key) ? values.get(key) : null),
    setItem: (key, value) => values.set(key, String(value)),
  };
};

const lead = {
  name: 'Asha Rao',
  email: 'asha@brand.in',
  whatsapp: '+91 98765 43210',
  leadId: 'DU-20261015-AB2C',
  revenueCurrency: 'INR',
  revenueLabel: '₹1,00,000–₹5,00,000',
  formLocation: 'contact',
};

test('a confirmed lead is handed to /thank-you through session storage', () => {
  const storage = createStorage();
  const now = Date.UTC(2026, 9, 15, 6);

  assert.equal(saveThankYouHandoff(lead, { storage, now }), true);
  assert.deepEqual(readThankYouHandoff({ storage, now: now + 60_000 }), lead);
});

test('the hand-off expires and ignores missing or malformed data', () => {
  const storage = createStorage();
  const now = Date.UTC(2026, 9, 15, 6);

  assert.equal(readThankYouHandoff({ storage, now }), null);
  saveThankYouHandoff(lead, { storage, now });
  assert.equal(readThankYouHandoff({ storage, now: now + 13 * 60 * 60 * 1000 }), null);

  storage.setItem('du:audit-request', '{not json');
  assert.equal(readThankYouHandoff({ storage, now }), null);
  saveThankYouHandoff({ ...lead, name: '  ' }, { storage, now });
  assert.equal(readThankYouHandoff({ storage, now }), null);
});

test('an unexpected lead ID is dropped so Step 2 cannot reference it', () => {
  const storage = createStorage();
  const now = Date.UTC(2026, 9, 15, 6);

  saveThankYouHandoff({ ...lead, leadId: '<script>' }, { storage, now });
  assert.equal(readThankYouHandoff({ storage, now }).leadId, '');
});

test('blocked storage never breaks the redirect or the page', () => {
  const blocked = {
    getItem: () => { throw new Error('SecurityError'); },
    setItem: () => { throw new Error('QuotaExceededError'); },
  };

  assert.equal(saveThankYouHandoff(lead, { storage: blocked }), false);
  assert.equal(saveThankYouHandoff(lead, { storage: null }), false);
  assert.equal(readThankYouHandoff({ storage: blocked }), null);
  assert.equal(readThankYouHandoff({ storage: null }), null);
});
