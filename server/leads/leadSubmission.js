import { createHash, randomBytes } from 'node:crypto';
import { BRAND } from '../../shared/brand.js';
import {
  describeLeadDetails,
  getAdSpendOptions,
  getMonthlyRevenueOptions,
  validateLeadDetailsPayload,
  validateLeadPayload,
} from '../../shared/leadSchema.js';
import { renderDetailsAlert, renderLeadAlert, renderVisitorConfirmation } from './leadEmails.js';

const MAX_BODY_BYTES = 10_000;
const MIN_FORM_COMPLETION_MS = 500;
const DEFAULT_RATE_LIMIT_MAX = 5;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_WEBHOOK_TIMEOUT_MS = 8_000;
const ephemeralRateLimitSalt = randomBytes(32).toString('hex');
const rateLimitStore = new Map();
const REVENUE_FIELD_EXPERIMENT_ID = 'revenue_range_field';
const TREATMENT_VARIANT = 'treatment';
const LEAD_SOURCE = 'digital-universe-free-amazon-audit';
const RESEND_EMAILS_URL = 'https://api.resend.com/emails';
// Resend's shared test sender only delivers to the Resend account's own email.
const DEFAULT_LEAD_EMAIL_FROM = 'Digital Universe Leads <onboarding@resend.dev>';

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

// Pasted dashboard values often carry stray whitespace, which is invalid in a header.
const getResendApiKey = (env) => String(env.RESEND_API_KEY || '').trim();

// The visitor confirmation needs a sender on a domain verified in Resend.
const getConfirmationSender = (env) => String(env.LEAD_CONFIRMATION_FROM || '').trim();

const LEAD_ID_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// e.g. DU-20261014-7K3P: the IST date plus a random suffix, so Step 2 can reference the lead.
export const createLeadId = (timestamp, bytes = randomBytes(4)) => {
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(timestamp)).replaceAll('-', '');
  const suffix = [...bytes].map((byte) => LEAD_ID_ALPHABET[byte % LEAD_ID_ALPHABET.length]).join('');
  return `DU-${date}-${suffix}`;
};

const FORM_LOCATIONS = new Set(['hero', 'contact_page']);
const getFormLocation = (value) => (FORM_LOCATIONS.has(value) ? value : 'unspecified');

const sendResendEmail = async ({ env, fetchImpl, signal, from, to, replyTo, email }) => {
  const result = await fetchImpl(RESEND_EMAILS_URL, {
    method: 'POST',
    redirect: 'error',
    headers: {
      Authorization: `Bearer ${getResendApiKey(env)}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject: email.subject,
      html: email.html,
      text: email.text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
    signal,
  });
  return { delivered: result.ok, status: result.status };
};

// Each configured channel receives the message independently; any one confirmed
// delivery means it reached the business.
const getDeliveryChannels = (env) => {
  const channels = [];

  const webhookUrl = getWebhookUrl(env);
  if (webhookUrl) {
    channels.push({
      name: 'webhook',
      send: async ({ payload }, { fetchImpl, signal }) => {
        const headers = { 'Content-Type': 'application/json' };
        if (env.LEAD_WEBHOOK_BEARER_TOKEN) {
          headers.Authorization = `Bearer ${env.LEAD_WEBHOOK_BEARER_TOKEN}`;
        }
        const result = await fetchImpl(webhookUrl, {
          method: 'POST',
          redirect: 'error',
          headers,
          body: JSON.stringify(payload),
          signal,
        });
        return { delivered: result.ok, status: result.status };
      },
    });
  }

  const emailRecipients = getLeadEmailRecipients(env);
  if (getResendApiKey(env) && emailRecipients.length > 0) {
    channels.push({
      name: 'email',
      send: ({ email, replyTo }, { fetchImpl, signal }) => sendResendEmail({
        env,
        fetchImpl,
        signal,
        from: env.LEAD_EMAIL_FROM || DEFAULT_LEAD_EMAIL_FROM,
        to: emailRecipients,
        replyTo,
        email,
      }),
    });
  }

  return channels;
};

const withTimeout = async (env, task) => {
  const timeoutMs = asPositiveInteger(env.LEAD_WEBHOOK_TIMEOUT_MS, DEFAULT_WEBHOOK_TIMEOUT_MS);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await task(controller.signal);
  } finally {
    clearTimeout(timeout);
  }
};

const deliverToChannels = async ({ channels, message, env, fetchImpl }) => {
  const outcomes = await withTimeout(env, (signal) => Promise.allSettled(
    channels.map((channel) => channel.send(message, { fetchImpl, signal })),
  ));

  outcomes.forEach((outcome, index) => {
    if (outcome.status === 'fulfilled' && outcome.value.delivered) return;
    // Channel name and HTTP status only; lead values are never logged.
    const detail = outcome.status === 'fulfilled' ? `HTTP ${outcome.value.status}` : 'no response';
    console.warn(`Lead delivery via ${channels[index].name} failed (${detail}).`);
  });

  return outcomes.some((outcome) => outcome.status === 'fulfilled' && outcome.value.delivered);
};

// Best effort: the lead is already delivered, so a failed confirmation is only logged.
const sendVisitorConfirmation = async ({ env, fetchImpl, lead, logoUrl }) => {
  const from = getConfirmationSender(env);
  if (!from || !getResendApiKey(env) || !lead.email) return;

  try {
    const result = await withTimeout(env, (signal) => sendResendEmail({
      env,
      fetchImpl,
      signal,
      from,
      to: [lead.email],
      replyTo: String(env.LEAD_CONFIRMATION_REPLY_TO || BRAND.contact.email).trim(),
      email: renderVisitorConfirmation(lead, { logoUrl }),
    }));
    if (!result.delivered) console.warn(`Visitor confirmation failed (HTTP ${result.status}).`);
  } catch {
    console.warn('Visitor confirmation failed (no response).');
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

  const receivedAt = new Date(now()).toISOString();
  const logoUrl = `${origin || BRAND.canonicalOrigin}${BRAND.logoPath}`;
  let message;
  let lead = null;
  let successBody;

  if (body.stage === 'details') {
    const validation = validateLeadDetailsPayload(body);
    if (!validation.isValid) {
      return response(422, {
        delivered: false,
        message: validation.errors.details || 'Please correct the highlighted fields.',
        errors: validation.errors,
      }, corsHeaders);
    }

    const details = validation.data;
    const described = describeLeadDetails(details);
    message = {
      payload: {
        source: LEAD_SOURCE,
        stage: 'details',
        receivedAt,
        leadId: details.leadId,
        name: details.name,
        email: details.email,
        whatsapp: details.whatsapp,
        storeUrl: details.storeUrl,
        marketplaces: details.marketplaces,
        sellerType: details.sellerType,
        ...(details.adSpend
          ? {
            monthlyAdSpendRange: details.adSpend,
            monthlyAdSpendCurrency: details.revenueCurrency,
            monthlyAdSpendRangeLabel: getAdSpendOptions(details.revenueCurrency).find(option => option.value === details.adSpend).label,
          }
          : {}),
        challenges: details.challenges,
        notes: details.notes,
      },
      email: renderDetailsAlert(details, described, { logoUrl }),
      replyTo: details.email || undefined,
    };
    successBody = { delivered: true, message: 'Thanks — your audit details have been shared.' };
  } else {
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

    lead = {
      source: LEAD_SOURCE,
      stage: 'lead',
      receivedAt,
      leadId: createLeadId(now()),
      formLocation: getFormLocation(body.formLocation),
      name: validation.data.name,
      email: validation.data.email,
      whatsapp: validation.data.whatsapp,
      ...(validation.data.monthlyRevenue
        ? {
          monthlyAmazonRevenueRange: validation.data.monthlyRevenue,
          monthlyAmazonRevenueCurrency: validation.data.revenueCurrency,
          monthlyAmazonRevenueRangeLabel: getMonthlyRevenueOptions(validation.data.revenueCurrency).find(option => option.value === validation.data.monthlyRevenue).label,
        }
        : {}),
      ...(leadExperiment ? { croExperiment: leadExperiment } : {}),
    };
    message = {
      payload: lead,
      email: renderLeadAlert(lead, { logoUrl }),
      replyTo: lead.email || undefined,
    };
    successBody = { delivered: true, message: 'Your Amazon audit request has been received.', leadId: lead.leadId };
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

  const delivered = await deliverToChannels({ channels, message, env, fetchImpl });
  if (!delivered) {
    return response(502, {
      delivered: false,
      message: 'We could not confirm delivery. Please try again or use WhatsApp.',
    }, corsHeaders);
  }

  if (lead) await sendVisitorConfirmation({ env, fetchImpl, lead, logoUrl });

  return response(200, successBody, corsHeaders);
};
