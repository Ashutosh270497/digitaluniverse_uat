import { handleLeadSubmission } from '../server/leads/leadSubmission.js';

const getClientIp = (request) => {
  const forwardedFor = request.headers?.['x-forwarded-for'];
  if (typeof forwardedFor === 'string') return forwardedFor.split(',')[0].trim();
  return request.socket?.remoteAddress || 'unknown';
};

export default async function handler(request, reply) {
  const result = await handleLeadSubmission({
    method: request.method,
    headers: request.headers,
    // Vercel parses JSON lazily; keep parsing errors inside the server's
    // guarded body handling so malformed JSON returns our JSON 400 response.
    get body() { return request.body; },
    ip: getClientIp(request),
  });

  Object.entries(result.headers).forEach(([name, value]) => reply.setHeader(name, value));
  reply.status(result.status);

  if (result.status === 204) {
    reply.end();
    return;
  }

  reply.json(result.body);
}
