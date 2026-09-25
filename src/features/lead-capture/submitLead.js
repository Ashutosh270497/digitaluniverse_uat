export class LeadSubmissionError extends Error {
  constructor(message, { status = 0, fieldErrors = {} } = {}) {
    super(message);
    this.name = 'LeadSubmissionError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const isSecureEndpoint = (endpoint) => {
  if (typeof endpoint !== 'string' || endpoint.trim() === '') return false;
  if (endpoint !== endpoint.trim() || /[\\\s]/.test(endpoint)) return false;
  if (endpoint.startsWith('/')) return !endpoint.startsWith('//');

  try {
    const url = new URL(endpoint);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
};

export const submitLeadRequest = async ({
  endpoint, payload, fetchImpl = globalThis.fetch, timeoutMs = 15_000,
}) => {
  if (!isSecureEndpoint(endpoint)) {
    throw new LeadSubmissionError('Audit delivery is not configured. Please use WhatsApp instead.');
  }

  if (typeof fetchImpl !== 'function') {
    throw new LeadSubmissionError('Audit delivery is unavailable. Please use WhatsApp instead.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let response;
  let result;
  try {
    response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'omit',
      redirect: 'error',
      signal: controller.signal,
      body: JSON.stringify(payload),
    });
    result = await response.json().catch(() => null);
  } catch {
    throw new LeadSubmissionError('We could not confirm delivery. Please try again or use WhatsApp.');
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok || result?.delivered !== true) {
    const fallbackMessage = response.status === 429
      ? 'Too many attempts. Please wait before trying again or use WhatsApp.'
      : 'We could not confirm delivery. Please try again or use WhatsApp.';

    throw new LeadSubmissionError(result?.message || fallbackMessage, {
      status: response.status,
      fieldErrors: result?.errors || {},
    });
  }

  return result;
};
