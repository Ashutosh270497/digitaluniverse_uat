import { createHash, randomBytes } from 'node:crypto';
import { getMonthlyRevenueOptions, validateLeadPayload } from '../../shared/leadSchema.js';

const MAX_BODY_BYTES = 10_000;
const MIN_FORM_COMPLETION_MS = 500;
const DEFAULT_RATE_LIMIT_MAX = 5;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_WEBHOOK_TIMEOUT_MS = 8_000;
const ephemeralRateLimitSalt = randomBytes(32).toString('hex');
const rateLimitStore = new Map();
const REVENUE_FIELD_EXPERIMENT_ID = 'revenue_range_field';
const TREATMENT_VARIANT = 'treatment';
const LEAD_SOURCE = 'digital-universe-pro-free-amazon-audit';
const RESEND_EMAILS_URL = 'https://api.resend.com/emails';
// Resend's shared test sender only delivers to the Resend account's own email.
const DEFAULT_LEAD_EMAIL_FROM = 'Digital Universe Pro Leads <onboarding@resend.dev>';

const readHeader = (headers, name) => {
  if (typeof headers?.get === 'function') return headers.get(name) || '';

  const entry = Object.entries(headers || {}).find(
    ([key]) => key.toLowerCase() === name.toLowerCase(),
  );
  return entry?.[1] || '';
};

const asPositiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const getAllowedOrigins = (env) => new Set(
  String(env.LEAD_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);

const isOriginAllowed = ({ origin, host, env }) => {
  if (!origin) return true;

  try {
    const url = new URL(origin);
    if (url.origin !== origin || url.protocol !== 'https:') return false;
    if (url.host === host) return true;
  } catch {
    return false;
  }

  return getAllowedOrigins(env).has(origin);
};

const getCorsHeaders = (origin) => origin
  ? {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Origin': origin,
      Vary: 'Origin',
    }
  : {};

const parseBody = (body) => {
  const parsed = typeof body === 'string' ? JSON.parse(body) : body;
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed;
  return null;
};

const getRateLimitKey = ({ ip, env }) => createHash('sha256')
  .update(`${env.LEAD_RATE_LIMIT_SALT || ephemeralRateLimitSalt}:${ip || 'unknown'}`)
  .digest('hex');

const consumeRateLimit = ({ ip, env, now }) => {
  const max = asPositiveInteger(env.LEAD_RATE_LIMIT_MAX, DEFAULT_RATE_LIMIT_MAX);
  const windowMs = asPositiveInteger(
    env.LEAD_RATE_LIMIT_WINDOW_MS,
    DEFAULT_RATE_LIMIT_WINDOW_MS,
  );
  const key = getRateLimitKey({ ip, env });
  const current = rateLimitStore.get(key);

  if (rateLimitStore.size > 1_000) {
    for (const [storedKey, entry] of rateLimitStore) {
      if (now >= entry.resetAt) rateLimitStore.delete(storedKey);
    }
  }

  if (!current || now >= current.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= max) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
};

const response = (status, body, headers = {}) => ({
  status,
  body,
  headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers },
});

const getWebhookUrl = (env) => {
  try {
    const url = new URL(env.LEAD_WEBHOOK_URL || '');
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
};

const getLeadEmailRecipients = (env) => String(env.LEAD_EMAIL_TO || '')
  .split(',')
  .map((email) => email.trim())
  .filter(Boolean);

const singleLine = (value) => value.replace(/\s+/g, ' ');

const formatReceivedAt = (receivedAt) => `${new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Kolkata',
}).format(new Date(receivedAt))} IST`;

const formatLeadLines = (lead) => {
  const viaWhatsApp = lead.contactMethod === 'whatsapp';
  return [
    `Name: ${singleLine(lead.name)}`,
    `${viaWhatsApp ? 'WhatsApp' : 'Email'}: ${singleLine(lead.contact)}`,
    ...(lead.monthlyAmazonRevenueRangeLabel
      ? [`Monthly Amazon revenue: ${lead.monthlyAmazonRevenueRangeLabel}`]
      : []),
    `Received: ${formatReceivedAt(lead.receivedAt)}`,
    ...(viaWhatsApp ? [`Chat: https://wa.me/${lead.contact.replace(/\D/g, '')}`] : []),
  ];
};

// Each configured channel receives the lead independently; any one confirmed
// delivery means the lead reached the business.
const getDeliveryChannels = (env) => {
  const channels = [];

  const webhookUrl = getWebhookUrl(env);
  if (webhookUrl) {
    channels.push({
      name: 'webhook',
      send: async (lead, { fetchImpl, signal }) => {
        const headers = { 'Content-Type': 'application/json' };
        if (env.LEAD_WEBHOOK_BEARER_TOKEN) {
          headers.Authorization = `Bearer ${env.LEAD_WEBHOOK_BEARER_TOKEN}`;
        }
        const result = await fetchImpl(webhookUrl, {
          method: 'POST',
          redirect: 'error',
          headers,
          body: JSON.stringify(lead),
          signal,
        });
        return { delivered: result.ok, status: result.status };
      },
    });
  }

  const emailRecipients = getLeadEmailRecipients(env);
  // Pasted dashboard values often carry stray whitespace, which is invalid in a header.
  const resendApiKey = String(env.RESEND_API_KEY || '').trim();
  if (resendApiKey && emailRecipients.length > 0) {
    channels.push({
      name: 'email',
      send: async (lead, { fetchImpl, signal }) => {
        const result = await fetchImpl(RESEND_EMAILS_URL, {
          method: 'POST',
          redirect: 'error',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: env.LEAD_EMAIL_FROM || DEFAULT_LEAD_EMAIL_FROM,
            to: emailRecipients,
            subject: `New Amazon audit lead: ${singleLine(lead.name)}`,
            text: ['New free Amazon audit request', '', ...formatLeadLines(lead)].join('\n'),
            ...(lead.contactMethod === 'email' ? { reply_to: lead.contact } : {}),
          }),
          signal,
        });
        return { delivered: result.ok, status: result.status };
      },
    });
  }

  return channels;
};

const getLeadExperiment = (body, env) => {
  const experimentId = typeof body.experimentId === 'string' ? body.experimentId.trim() : '';
  const experimentVariant = typeof body.experimentVariant === 'string'
    ? body.experimentVariant.trim()
    : '';
  const approved = String(env.CRO_EXPERIMENT_APPROVED || '').toLowerCase() === 'true';

  if (
    !approved
    || experimentId !== String(env.CRO_ACTIVE_EXPERIMENT_ID || '').trim()
    || !['control', TREATMENT_VARIANT].includes(experimentVariant)
  ) {
    return null;
  }

  return { experimentId, experimentVariant };
};

export const resetLeadRateLimitsForTests = () => rateLimitStore.clear();

export const handleLeadSubmission = async (
  request,
  {
    env = globalThis.process?.env || {},
    fetchImpl = globalThis.fetch,
    now = () => Date.now(),
  } = {},
) => {
  const method = String(request.method || '').toUpperCase();
  const origin = readHeader(request.headers, 'origin');
  const host = readHeader(request.headers, 'host');
  const corsHeaders = getCorsHeaders(origin);

  if (!isOriginAllowed({ origin, host, env })) {
    return response(403, { delivered: false, message: 'Request origin is not allowed.' });
  }

  if (method === 'OPTIONS') return response(204, null, corsHeaders);

  if (method !== 'POST') {
    return response(405, { delivered: false, message: 'Method not allowed.' }, {
      ...corsHeaders,
      Allow: 'POST, OPTIONS',
    });
  }

  const contentType = readHeader(request.headers, 'content-type');
  if (contentType.split(';', 1)[0].trim().toLowerCase() !== 'application/json') {
    return response(415, {
      delivered: false,
      message: 'Content-Type must be application/json.',
    }, corsHeaders);
  }

  const rateLimit = consumeRateLimit({ ip: request.ip, env, now: now() });
  if (!rateLimit.allowed) {
    return response(429, {
      delivered: false,
      message: 'Too many attempts. Please wait before trying again.',
    }, {
      ...corsHeaders,
      'Retry-After': String(rateLimit.retryAfterSeconds),
    });
  }

  let body;
  try {
    const serializedBody = typeof request.body === 'string'
      ? request.body
      : JSON.stringify(request.body || {});
    if (Buffer.byteLength(serializedBody, 'utf8') > MAX_BODY_BYTES) {
      return response(413, { delivered: false, message: 'Request is too large.' }, corsHeaders);
    }
    body = parseBody(request.body);
  } catch {
    return response(400, { delivered: false, message: 'Invalid JSON request.' }, corsHeaders);
  }

  if (!body) {
    return response(400, { delivered: false, message: 'Invalid request body.' }, corsHeaders);
  }

  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return response(400, { delivered: false, message: 'Submission could not be accepted.' }, corsHeaders);
  }

  const startedAt = Number(body.startedAt);
  if (!Number.isFinite(startedAt) || now() - startedAt < MIN_FORM_COMPLETION_MS) {
    return response(400, { delivered: false, message: 'Please review the form and try again.' }, corsHeaders);
  }

  const leadExperiment = getLeadExperiment(body, env);
  const omitRevenueRange = leadExperiment?.experimentId === REVENUE_FIELD_EXPERIMENT_ID
    && leadExperiment.experimentVariant === TREATMENT_VARIANT;
  const validation = validateLeadPayload(body, {
    requireMonthlyRevenue: !omitRevenueRange,
  });
  if (!validation.isValid) {
    return response(422, {
      delivered: false,
      message: 'Please correct the highlighted fields.',
      errors: validation.errors,
    }, corsHeaders);
  }

  const channels = getDeliveryChannels(env);
  if (channels.length === 0) {
    return response(503, {
      delivered: false,
      message: 'Audit delivery is not configured. Please use WhatsApp instead.',
    }, corsHeaders);
  }

  if (typeof fetchImpl !== 'function') {
    return response(503, {
      delivered: false,
      message: 'Audit delivery is unavailable. Please use WhatsApp instead.',
    }, corsHeaders);
  }

  const lead = {
    source: LEAD_SOURCE,
    receivedAt: new Date(now()).toISOString(),
    name: validation.data.name,
    contactMethod: validation.data.contactMethod,
    contact: validation.data.contact,
    ...(validation.data.monthlyRevenue
      ? {
        monthlyAmazonRevenueRange: validation.data.monthlyRevenue,
        monthlyAmazonRevenueCurrency: validation.data.revenueCurrency,
        monthlyAmazonRevenueRangeLabel: getMonthlyRevenueOptions(validation.data.revenueCurrency).find(option => option.value === validation.data.monthlyRevenue).label,
      }
      : {}),
    ...(leadExperiment ? { croExperiment: leadExperiment } : {}),
  };

  const timeoutMs = asPositiveInteger(env.LEAD_WEBHOOK_TIMEOUT_MS, DEFAULT_WEBHOOK_TIMEOUT_MS);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let outcomes;
  try {
    outcomes = await Promise.allSettled(
      channels.map((channel) => channel.send(lead, { fetchImpl, signal: controller.signal })),
    );
  } finally {
    clearTimeout(timeout);
  }

  outcomes.forEach((outcome, index) => {
    if (outcome.status === 'fulfilled' && outcome.value.delivered) return;
    // Channel name and HTTP status only; lead values are never logged.
    const detail = outcome.status === 'fulfilled' ? `HTTP ${outcome.value.status}` : 'no response';
    console.warn(`Lead delivery via ${channels[index].name} failed (${detail}).`);
  });

  if (!outcomes.some((outcome) => outcome.status === 'fulfilled' && outcome.value.delivered)) {
    return response(502, {
      delivered: false,
      message: 'We could not confirm delivery. Please try again or use WhatsApp.',
    }, corsHeaders);
  }

  return response(200, {
    delivered: true,
    message: 'Your Amazon audit request has been received.',
  }, corsHeaders);
};
