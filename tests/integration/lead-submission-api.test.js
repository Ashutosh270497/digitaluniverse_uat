import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  handleLeadSubmission,
  resetLeadRateLimitsForTests,
} from '../../server/leads/leadSubmission.js';

const NOW = 1_800_000_000_000;
const validBody = {
  name: 'A Seller',
  contactMethod: 'email',
  contact: 'seller@example.com',
  revenueCurrency: 'USD',
  monthlyRevenue: '50k-200k',
  website: '',
  startedAt: NOW - 2_000,
};
const configuredEnv = {
  LEAD_WEBHOOK_URL: 'https://crm.example.test/leads',
  LEAD_WEBHOOK_BEARER_TOKEN: 'test-token',
  LEAD_ALLOWED_ORIGINS: 'https://digitaluniversepro.co',
  LEAD_RATE_LIMIT_SALT: 'test-rate-limit-salt',
};

const createRequest = (body, ip = '203.0.113.10') => ({
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    host: 'api.digitaluniversepro.co',
    origin: 'https://digitaluniversepro.co',
  },
  body,
  ip,
});

beforeEach(() => resetLeadRateLimitsForTests());

test('request size is limited by UTF-8 bytes, including multibyte input', async () => {
  const body = JSON.stringify({ ...validBody, extra: '😀'.repeat(2600) });
  assert.ok(body.length < 10_000);
  assert.ok(Buffer.byteLength(body) > 10_000);
  const result = await handleLeadSubmission(createRequest(body), {
    env: configuredEnv, now: () => NOW, fetchImpl: () => assert.fail('must not forward oversized data'),
  });
  assert.equal(result.status, 413);
  assert.equal(result.headers['Cache-Control'], 'no-store');
});

test('JSON arrays, primitives and malformed bodies receive a controlled rejection', async () => {
  for (const body of ['[]', 'null', '42', '"text"', '{broken']) {
    const result = await handleLeadSubmission(createRequest(body), { env: configuredEnv, now: () => NOW });
    assert.equal(result.status, 400, body);
    assert.equal(result.body.delivered, false);
  }
});

test('origin and content-type checks reject requests before delivery', async () => {
  for (const origin of ['https://unrelated.test', 'http://api.digitaluniversepro.co', 'null', 'https://digitaluniversepro.co/path']) {
    const request = createRequest(validBody);
    request.headers.origin = origin;
    const result = await handleLeadSubmission(request, { env: configuredEnv });
    assert.equal(result.status, 403, origin);
    assert.equal(result.headers['Access-Control-Allow-Origin'], undefined);
  }
  const request = createRequest(validBody);
  request.headers['content-type'] = 'application/json-not-really';
  assert.equal((await handleLeadSubmission(request, { env: configuredEnv })).status, 415);
});

test('Vercel same-origin requests and GoDaddy cross-origin preflight are supported', async () => {
  const request = createRequest(validBody);
  request.headers.host = 'founder-review.vercel.app';
  request.headers.origin = 'https://founder-review.vercel.app';
  const result = await handleLeadSubmission(request, {
    env: configuredEnv, now: () => NOW, fetchImpl: async () => ({ ok: true }),
  });
  assert.equal(result.status, 200);
  const preflight = createRequest(undefined);
  preflight.method = 'OPTIONS';
  const options = await handleLeadSubmission(preflight, { env: configuredEnv });
  assert.equal(options.status, 204);
  assert.equal(options.headers['Access-Control-Allow-Origin'], 'https://digitaluniversepro.co');
  assert.equal(options.headers['Cache-Control'], 'no-store');
});

test('webhook timeout returns a delivery failure without automatic retry', async () => {
  let calls = 0;
  const result = await handleLeadSubmission(createRequest(validBody), {
    env: { ...configuredEnv, LEAD_WEBHOOK_TIMEOUT_MS: '10' }, now: () => NOW,
    fetchImpl: (_url, { signal, redirect }) => {
      calls += 1;
      assert.equal(redirect, 'error');
      return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('timeout'))));
    },
  });
  assert.equal(result.status, 502);
  assert.equal(result.body.delivered, false);
  assert.equal(calls, 1);
});

test('server rejects an empty submission', async () => {
  const result = await handleLeadSubmission(
    createRequest({ website: '', startedAt: NOW - 2_000 }),
    { env: configuredEnv, now: () => NOW },
  );

  assert.equal(result.status, 422);
  assert.equal(result.body.delivered, false);
  assert.equal(result.body.errors.name, 'Enter your name.');
});

test('server rejects an invalid email', async () => {
  const result = await handleLeadSubmission(
    createRequest({ ...validBody, contact: 'not-an-email' }),
    { env: configuredEnv, now: () => NOW },
  );

  assert.equal(result.status, 422);
  assert.equal(result.body.delivered, false);
  assert.equal(result.body.errors.contact, 'Enter a valid work email.');
});

test('server rejects an invalid currency', async () => {
  const result = await handleLeadSubmission(
    createRequest({ ...validBody, revenueCurrency: 'EUR' }),
    { env: configuredEnv, now: () => NOW },
  );

  assert.equal(result.status, 422);
  assert.equal(result.body.delivered, false);
  assert.equal(result.body.errors.revenueCurrency, 'Choose USD, INR or GBP for your revenue range.');
});

test('upstream server error is returned as a delivery failure', async () => {
  const result = await handleLeadSubmission(createRequest(validBody), {
    env: configuredEnv,
    now: () => NOW,
    fetchImpl: async () => ({ ok: false }),
  });

  assert.equal(result.status, 502);
  assert.equal(result.body.delivered, false);
});

test('successful submission POSTs JSON and confirms acknowledged delivery', async () => {
  let webhookCall;
  const result = await handleLeadSubmission(createRequest(validBody), {
    env: configuredEnv,
    now: () => NOW,
    fetchImpl: async (url, options) => {
      webhookCall = { url, options };
      return { ok: true };
    },
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.delivered, true);
  assert.equal(webhookCall.url, configuredEnv.LEAD_WEBHOOK_URL);
  assert.equal(webhookCall.options.method, 'POST');
  assert.equal(webhookCall.options.headers.Authorization, 'Bearer test-token');

  const payload = JSON.parse(webhookCall.options.body);
  assert.equal(payload.contact, validBody.contact);
  assert.equal('amazonStoreOrAsinUrl' in payload, false);
  assert.equal(payload.monthlyAmazonRevenueCurrency, 'USD');
  assert.equal(payload.monthlyAmazonRevenueRangeLabel, '$50,000–$200,000');
  assert.equal('website' in payload, false);
  assert.equal('startedAt' in payload, false);
  assert.equal('ip' in payload, false);
});

test('missing webhook configuration fails explicitly', async () => {
  const result = await handleLeadSubmission(createRequest(validBody), {
    env: { LEAD_ALLOWED_ORIGINS: 'https://digitaluniversepro.co' },
    now: () => NOW,
  });

  assert.equal(result.status, 503);
  assert.equal(result.body.delivered, false);
  assert.match(result.body.message, /not configured/i);
});

test('honeypot submission is rejected before webhook delivery', async () => {
  let webhookCalled = false;
  const result = await handleLeadSubmission(
    createRequest({ ...validBody, website: 'https://bot.example' }),
    {
      env: configuredEnv,
      now: () => NOW,
      fetchImpl: async () => {
        webhookCalled = true;
        return { ok: true };
      },
    },
  );

  assert.equal(result.status, 400);
  assert.equal(result.body.delivered, false);
  assert.equal(webhookCalled, false);
});

test('rate limiting rejects excess attempts without storing raw lead data', async () => {
  const env = { ...configuredEnv, LEAD_RATE_LIMIT_MAX: '2' };
  const dependencies = {
    env,
    now: () => NOW,
    fetchImpl: async () => ({ ok: true }),
  };

  assert.equal((await handleLeadSubmission(createRequest(validBody), dependencies)).status, 200);
  assert.equal((await handleLeadSubmission(createRequest(validBody), dependencies)).status, 200);
  const limited = await handleLeadSubmission(createRequest(validBody), dependencies);

  assert.equal(limited.status, 429);
  assert.equal(limited.body.delivered, false);
  assert.equal(limited.headers['Retry-After'], '600');
});

test('server accepts a missing revenue range only for the approved treatment assignment', async () => {
  let webhookPayload;
  const treatmentBody = {
    ...validBody,
    monthlyRevenue: '',
    experimentId: 'revenue_range_field',
    experimentVariant: 'treatment',
  };
  const result = await handleLeadSubmission(createRequest(treatmentBody), {
    env: {
      ...configuredEnv,
      CRO_EXPERIMENT_APPROVED: 'true',
      CRO_ACTIVE_EXPERIMENT_ID: 'revenue_range_field',
    },
    now: () => NOW,
    fetchImpl: async (_url, options) => {
      webhookPayload = JSON.parse(options.body);
      return { ok: true };
    },
  });

  assert.equal(result.status, 200);
  assert.equal('monthlyAmazonRevenueRange' in webhookPayload, false);
  assert.deepEqual(webhookPayload.croExperiment, {
    experimentId: 'revenue_range_field',
    experimentVariant: 'treatment',
  });
});

test('client assignment cannot bypass revenue validation without matching server approval', async () => {
  const treatmentBody = {
    ...validBody,
    monthlyRevenue: '',
    experimentId: 'revenue_range_field',
    experimentVariant: 'treatment',
  };
  const result = await handleLeadSubmission(createRequest(treatmentBody), {
    env: configuredEnv,
    now: () => NOW,
  });

  assert.equal(result.status, 422);
  assert.equal(result.body.errors.monthlyRevenue, 'Select your monthly Amazon revenue range.');
});

for (const [currency, range, expectedLabel] of [['INR', '1l-5l', '₹1,00,000–₹5,00,000'], ['GBP', '10k-50k', '£10,000–£50,000']]) {
  test(`webhook preserves ${currency} revenue and drops the retired URL field`, async () => {
    let sent;
    const result = await handleLeadSubmission(createRequest({ ...validBody, revenueCurrency: currency, monthlyRevenue: range, amazonUrl: 'https://example.com/old-field' }), {
      env: configuredEnv, now: () => NOW,
      fetchImpl: async (_url, options) => { sent = JSON.parse(options.body); return { ok: true }; },
    });
    assert.equal(result.status, 200);
    assert.equal(sent.monthlyAmazonRevenueCurrency, currency);
    assert.equal(sent.monthlyAmazonRevenueRange, range);
    assert.equal(sent.monthlyAmazonRevenueRangeLabel, expectedLabel);
    assert.equal('amazonStoreOrAsinUrl' in sent, false);
  });
}

test('server rejects a range that belongs to another currency before delivery', async () => {
  const result = await handleLeadSubmission(createRequest({ ...validBody, revenueCurrency: 'INR' }), {
    env: configuredEnv, now: () => NOW, fetchImpl: () => assert.fail('invalid currency/range pair must not reach webhook'),
  });
  assert.equal(result.status, 422);
  assert.ok(result.body.errors.monthlyRevenue);
});
