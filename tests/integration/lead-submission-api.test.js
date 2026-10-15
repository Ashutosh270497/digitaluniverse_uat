import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  createLeadId,
  handleLeadSubmission,
  resetLeadRateLimitsForTests,
} from '../../server/leads/leadSubmission.js';

const NOW = 1_800_000_000_000;
const validBody = {
  name: 'A Seller',
  email: 'seller@example.com',
  whatsapp: '+44 7700 900123',
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
    createRequest({ ...validBody, email: 'not-an-email' }),
    { env: configuredEnv, now: () => NOW },
  );

  assert.equal(result.status, 422);
  assert.equal(result.body.delivered, false);
  assert.equal(result.body.errors.email, 'Enter a valid email address, for example you@yourbrand.com.');
});

test('server requires a WhatsApp number alongside the email', async () => {
  const result = await handleLeadSubmission(
    createRequest({ ...validBody, whatsapp: '' }),
    { env: configuredEnv, now: () => NOW, fetchImpl: () => assert.fail('an incomplete lead must not be delivered') },
  );

  assert.equal(result.status, 422);
  assert.equal(result.body.errors.whatsapp, 'Enter your WhatsApp number, including the country code.');
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
  assert.equal(payload.email, validBody.email);
  assert.equal(payload.whatsapp, validBody.whatsapp);
  assert.equal('contact' in payload, false);
  assert.equal('contactMethod' in payload, false);
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

const captureCalls = () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url: String(url), options, body: JSON.parse(options.body) });
    return { ok: true, status: 200 };
  };
  return { calls, fetchImpl };
};

test('email alert receives a branded lead email with a lead ID', async () => {
  const { calls, fetchImpl } = captureCalls();
  const result = await handleLeadSubmission(createRequest({ ...validBody, formLocation: 'hero' }), {
    env: notificationEnv, now: () => NOW, fetchImpl,
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.delivered, true);
  assert.match(result.body.leadId, /^DU-20270115-[A-Z0-9]{4}$/);
  assert.equal(calls.length, 1);

  const [email] = calls;
  assert.ok(isEmailCall(email.url));
  assert.equal(email.options.method, 'POST');
  assert.equal(email.options.redirect, 'error');
  assert.equal(email.options.headers.Authorization, 'Bearer re_test_key');
  assert.equal(email.body.from, 'Digital Universe Leads <onboarding@resend.dev>');
  assert.deepEqual(email.body.to, ['owner@example.com']);
  assert.equal(email.body.reply_to, validBody.email);
  assert.equal(email.body.subject, 'New audit lead: A Seller · $50K–$200K/mo');
  assert.match(email.body.html, /<!doctype html>/);
  assert.match(email.body.html, /Homepage — hero form/);
  assert.match(email.body.html, new RegExp(result.body.leadId));
  assert.match(email.body.html, /Reply by email/);
  assert.match(email.body.html, /href="https:\/\/wa\.me\/447700900123"/);
  assert.match(email.body.html, /href="tel:\+447700900123"/);
  assert.match(email.body.text, /Email: seller@example\.com/);
  assert.match(email.body.text, /WhatsApp: \+44 7700 900123/);
  assert.match(email.body.text, /Monthly revenue: \$50,000–\$200,000 \(USD\)/);
  assert.match(email.body.text, /Submitted: 15 Jan 2027.*IST/);
  assert.match(email.body.html, /https:\/\/digitaluniversepro\.co\/brand\/digital-universe-logo\.jpg/);
});

test('legacy single-contact WhatsApp leads still get chat and call actions and no email reply-to', async () => {
  const { calls, fetchImpl } = captureCalls();
  const { email: _email, whatsapp: _whatsapp, ...legacyBase } = validBody;
  const body = { ...legacyBase, contactMethod: 'whatsapp', contact: '+44 7700 900123', revenueCurrency: 'INR', monthlyRevenue: '1l-5l' };
  const result = await handleLeadSubmission(createRequest(body), { env: notificationEnv, now: () => NOW, fetchImpl });

  assert.equal(result.status, 200);
  const email = calls.find(({ url }) => isEmailCall(url)).body;
  assert.equal('reply_to' in email, false);
  assert.equal(email.subject, 'New audit lead: A Seller · ₹1L–₹5L/mo');
  assert.match(email.html, /href="https:\/\/wa\.me\/447700900123"/);
  assert.match(email.html, /href="tel:\+447700900123"/);
  assert.doesNotMatch(email.html, /Reply by email/);
  assert.match(email.text, /Monthly revenue: ₹1,00,000–₹5,00,000 \(INR\)/);
});

test('visitor-supplied text is HTML-escaped in emails', async () => {
  const { calls, fetchImpl } = captureCalls();
  await handleLeadSubmission(createRequest({ ...validBody, name: '<img src=x onerror=alert(1)> Seller' }), {
    env: notificationEnv, now: () => NOW, fetchImpl,
  });

  const email = calls[0].body;
  assert.doesNotMatch(email.html, /<img src=x/);
  assert.match(email.html, /&lt;img src=x onerror=alert\(1\)&gt; Seller/);
});

test('the visitor confirmation goes to every lead with an email once a verified sender is configured', async () => {
  const confirmationEnv = { ...notificationEnv, LEAD_CONFIRMATION_FROM: 'Digital Universe <hello@mail.digitaluniversepro.co>' };

  const withoutSender = captureCalls();
  await handleLeadSubmission(createRequest(validBody), { env: notificationEnv, now: () => NOW, fetchImpl: withoutSender.fetchImpl });
  assert.equal(withoutSender.calls.length, 1, 'no confirmation without a verified sender');

  resetLeadRateLimitsForTests();
  const emailLead = captureCalls();
  const result = await handleLeadSubmission(createRequest(validBody), { env: confirmationEnv, now: () => NOW, fetchImpl: emailLead.fetchImpl });
  assert.equal(result.status, 200);
  assert.equal(emailLead.calls.length, 2);
  const confirmation = emailLead.calls[1].body;
  assert.deepEqual(confirmation.to, [validBody.email]);
  assert.equal(confirmation.from, 'Digital Universe <hello@mail.digitaluniversepro.co>');
  assert.equal(confirmation.reply_to, 'support@digitaluniversepro.co');
  assert.equal(confirmation.subject, 'Your free Amazon audit request is confirmed');
  assert.match(confirmation.html, /Thanks, A — we’ve got your request\./);
  assert.match(confirmation.text, /on WhatsApp at \+44 7700 900123 and by email at seller@example\.com/);
  assert.match(confirmation.text, /3\. We reach out on WhatsApp/);

  resetLeadRateLimitsForTests();
  const whatsappLead = captureCalls();
  const { email: _email, whatsapp: _whatsapp, ...legacyBase } = validBody;
  await handleLeadSubmission(createRequest({ ...legacyBase, contactMethod: 'whatsapp', contact: '+919876543210' }), {
    env: confirmationEnv, now: () => NOW, fetchImpl: whatsappLead.fetchImpl,
  });
  assert.equal(whatsappLead.calls.length, 1, 'legacy WhatsApp-only leads have no email address to confirm');
});

test('a failed visitor confirmation does not fail a delivered lead', async (t) => {
  const warn = t.mock.method(console, 'warn', () => {});
  let call = 0;
  const result = await handleLeadSubmission(createRequest(validBody), {
    env: { ...notificationEnv, LEAD_CONFIRMATION_FROM: 'hello@mail.digitaluniversepro.co' },
    now: () => NOW,
    fetchImpl: async () => (++call === 1 ? { ok: true, status: 200 } : { ok: false, status: 403 }),
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.delivered, true);
  assert.deepEqual(warn.mock.calls.map(({ arguments: [line] }) => line), ['Visitor confirmation failed (HTTP 403).']);
});

const detailsBody = {
  stage: 'details',
  leadId: 'DU-20270115-AB2C',
  name: 'A Seller',
  email: 'seller@example.com',
  whatsapp: '+919876543210',
  revenueCurrency: 'INR',
  storeUrl: 'amazon.in/stores/YourBrand',
  marketplaces: ['in', 'us'],
  sellerType: 'brand-owner',
  adSpend: '50k-2l',
  challenges: ['ppc', 'rankings'],
  notes: 'Best seller dropped last month.',
  website: '',
  startedAt: NOW - 60_000,
};

test('Step 2 details are delivered as a follow-up referencing the lead ID', async () => {
  const { calls, fetchImpl } = captureCalls();
  const result = await handleLeadSubmission(createRequest(detailsBody), {
    env: { ...notificationEnv, LEAD_WEBHOOK_URL: 'https://crm.example.test/leads' }, now: () => NOW, fetchImpl,
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.delivered, true);
  assert.equal('leadId' in result.body, false);
  const email = calls.find(({ url }) => isEmailCall(url)).body;
  assert.equal(email.subject, 'Audit details added: A Seller (DU-20270115-AB2C)');
  assert.match(email.text, /Marketplaces: Amazon India, Amazon US/);
  assert.match(email.text, /Ad spend: ₹50,000–₹2,00,000 \/ month/);
  assert.match(email.text, /Challenges: High ACoS \/ PPC waste, Low rankings & visibility/);
  const webhook = calls.find(({ url }) => !isEmailCall(url)).body;
  assert.equal(webhook.stage, 'details');
  assert.equal(webhook.leadId, 'DU-20270115-AB2C');
  assert.equal(webhook.email, 'seller@example.com');
  assert.equal(webhook.whatsapp, '+919876543210');
  assert.deepEqual(webhook.marketplaces, ['in', 'us']);
  assert.equal(webhook.monthlyAdSpendRangeLabel, '₹50,000–₹2,00,000');
  assert.equal('website' in webhook, false);
});

test('Step 2 rejects an unknown lead, empty answers and values outside the lists', async () => {
  for (const [body, field] of [
    [{ ...detailsBody, leadId: 'not-a-lead' }, 'leadId'],
    [{ ...detailsBody, storeUrl: '', marketplaces: [], sellerType: '', adSpend: '', challenges: [], notes: '' }, 'details'],
    [{ ...detailsBody, marketplaces: ['mars'] }, 'marketplaces'],
    [{ ...detailsBody, adSpend: '10k-50k' }, 'adSpend'],
    [{ ...detailsBody, storeUrl: 'not a link' }, 'storeUrl'],
  ]) {
    resetLeadRateLimitsForTests();
    const result = await handleLeadSubmission(createRequest(body), {
      env: notificationEnv, now: () => NOW, fetchImpl: () => assert.fail('invalid details must not be delivered'),
    });
    assert.equal(result.status, 422, field);
    assert.ok(result.body.errors[field], field);
  }
});

test('lead IDs use the IST date and an unambiguous suffix', () => {
  assert.equal(createLeadId(NOW, Buffer.from([0, 1, 31, 32])), 'DU-20270115-AB9A');
  assert.match(createLeadId(Date.UTC(2026, 9, 13, 20, 0)), /^DU-20261014-[A-Z2-9]{4}$/);
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
