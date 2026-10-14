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

test('webhook timeout returns a delivery failure without automatic retry', async (t) => {
  t.mock.method(console, 'warn', () => {});
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

test('upstream server error is returned as a delivery failure', async (t) => {
  t.mock.method(console, 'warn', () => {});
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

const notificationEnv = {
  LEAD_ALLOWED_ORIGINS: 'https://digitaluniversepro.co',
  LEAD_RATE_LIMIT_SALT: 'test-rate-limit-salt',
  RESEND_API_KEY: ' re_test_key\n',
  LEAD_EMAIL_TO: 'owner@example.com',
};
const isEmailCall = (url) => String(url) === 'https://api.resend.com/emails';

test('email alert receives the lead', async () => {
  const calls = [];
  const result = await handleLeadSubmission(createRequest(validBody), {
    env: notificationEnv,
    now: () => NOW,
    fetchImpl: async (url, options) => {
      calls.push({ url: String(url), options });
      return { ok: true, status: 200 };
    },
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.delivered, true);
  assert.equal(calls.length, 1);

  const [email] = calls;
  assert.ok(isEmailCall(email.url));
  assert.equal(email.options.method, 'POST');
  assert.equal(email.options.redirect, 'error');
  assert.equal(email.options.headers.Authorization, 'Bearer re_test_key');
  const message = JSON.parse(email.options.body);
  assert.equal(message.from, 'Digital Universe Pro Leads <onboarding@resend.dev>');
  assert.deepEqual(message.to, ['owner@example.com']);
  assert.equal(message.reply_to, validBody.contact);
  assert.equal(message.subject, 'New Amazon audit lead: A Seller');
  assert.match(message.text, /Name: A Seller\nEmail: seller@example\.com/);
  assert.match(message.text, /Monthly Amazon revenue: \$50,000–\$200,000/);
  assert.match(message.text, /Received: 15 Jan 2027.*IST/);
});

test('WhatsApp leads include a chat link and no email reply-to', async () => {
  const calls = [];
  const body = {
    ...validBody,
    contactMethod: 'whatsapp',
    contact: '+44 7700 900123',
    revenueCurrency: 'INR',
    monthlyRevenue: '1l-5l',
  };
  const result = await handleLeadSubmission(createRequest(body), {
    env: notificationEnv,
    now: () => NOW,
    fetchImpl: async (url, options) => {
      calls.push({ url: String(url), options });
      return { ok: true, status: 200 };
    },
  });

  assert.equal(result.status, 200);
  const message = JSON.parse(calls.find(({ url }) => isEmailCall(url)).options.body);
  assert.equal('reply_to' in message, false);
  assert.match(message.text, /WhatsApp: \+44 7700 900123/);
  assert.match(message.text, /Monthly Amazon revenue: ₹1,00,000–₹5,00,000/);
  assert.match(message.text, /Chat: https:\/\/wa\.me\/447700900123/);
});

test('rejected email delivery is logged without lead values', async (t) => {
  const warn = t.mock.method(console, 'warn', () => {});
  const result = await handleLeadSubmission(createRequest(validBody), {
    env: notificationEnv,
    now: () => NOW,
    fetchImpl: async () => ({ ok: false, status: 403 }),
  });

  assert.equal(result.status, 502);
  assert.equal(result.body.delivered, false);
  assert.deepEqual(
    warn.mock.calls.map(({ arguments: [line] }) => line),
    ['Lead delivery via email failed (HTTP 403).'],
  );
});

test('one confirmed channel is enough when another channel fails', async (t) => {
  const warn = t.mock.method(console, 'warn', () => {});
  const result = await handleLeadSubmission(createRequest(validBody), {
    env: { ...notificationEnv, LEAD_WEBHOOK_URL: 'https://crm.example.test/leads' },
    now: () => NOW,
    fetchImpl: async (url) => {
      if (isEmailCall(url)) throw new Error('network down');
      return { ok: true, status: 200 };
    },
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.delivered, true);
  assert.deepEqual(
    warn.mock.calls.map(({ arguments: [line] }) => line),
    ['Lead delivery via email failed (no response).'],
  );
});

test('every channel failing returns a delivery failure', async (t) => {
  t.mock.method(console, 'warn', () => {});
  const result = await handleLeadSubmission(createRequest(validBody), {
    env: { ...notificationEnv, LEAD_WEBHOOK_URL: 'https://crm.example.test/leads' },
    now: () => NOW,
    fetchImpl: async (url) => (isEmailCall(url) ? { ok: false, status: 403 } : { ok: false, status: 500 }),
  });

  assert.equal(result.status, 502);
  assert.equal(result.body.delivered, false);
});

test('an email alert missing its key or recipient is not configured', async () => {
  for (const env of [
    { ...notificationEnv, LEAD_EMAIL_TO: ' ' },
    { ...notificationEnv, RESEND_API_KEY: '' },
  ]) {
    resetLeadRateLimitsForTests();
    const result = await handleLeadSubmission(createRequest(validBody), {
      env,
      now: () => NOW,
      fetchImpl: () => assert.fail('an incomplete channel must not be called'),
    });
    assert.equal(result.status, 503);
    assert.match(result.body.message, /not configured/i);
  }
});
