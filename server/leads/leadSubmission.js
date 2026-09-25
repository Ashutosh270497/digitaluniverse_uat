import { createHash, randomBytes } from 'node:crypto';
import { validateLeadPayload } from '../../shared/leadSchema.js';

const MAX_BODY_BYTES = 10_000;
const MIN_FORM_COMPLETION_MS = 500;
const DEFAULT_RATE_LIMIT_MAX = 5;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_WEBHOOK_TIMEOUT_MS = 8_000;
const ephemeralRateLimitSalt = randomBytes(32).toString('hex');
const rateLimitStore = new Map();
const REVENUE_FIELD_EXPERIMENT_ID = 'revenue_range_field';
const TREATMENT_VARIANT = 'treatment';

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

  const webhookUrl = getWebhookUrl(env);
  if (!webhookUrl) {
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

  const timeoutMs = asPositiveInteger(env.LEAD_WEBHOOK_TIMEOUT_MS, DEFAULT_WEBHOOK_TIMEOUT_MS);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const webhookHeaders = { 'Content-Type': 'application/json' };
  if (env.LEAD_WEBHOOK_BEARER_TOKEN) {
    webhookHeaders.Authorization = `Bearer ${env.LEAD_WEBHOOK_BEARER_TOKEN}`;
  }

  let webhookResponse;
  try {
    webhookResponse = await fetchImpl(webhookUrl, {
      method: 'POST',
      redirect: 'error',
      headers: webhookHeaders,
      body: JSON.stringify({
        source: 'digital-universe-pro-free-amazon-audit',
        receivedAt: new Date(now()).toISOString(),
        name: validation.data.name,
        contactMethod: validation.data.contactMethod,
        contact: validation.data.contact,
        amazonStoreOrAsinUrl: validation.data.amazonUrl,
        ...(validation.data.monthlyRevenue
          ? { monthlyAmazonRevenueRange: validation.data.monthlyRevenue }
          : {}),
        ...(leadExperiment ? { croExperiment: leadExperiment } : {}),
      }),
      signal: controller.signal,
    });
  } catch {
    return response(502, {
      delivered: false,
      message: 'We could not confirm delivery. Please try again or use WhatsApp.',
    }, corsHeaders);
  } finally {
    clearTimeout(timeout);
  }

  if (!webhookResponse.ok) {
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
