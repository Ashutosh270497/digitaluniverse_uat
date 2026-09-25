import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../../api/leads.js';

const createReply = () => ({
  headers: {},
  setHeader(name, value) { this.headers[name] = value; },
  status(code) { this.statusCode = code; return this; },
  json(body) { this.body = body; },
  end() { this.ended = true; },
});

test('Vercel lazy JSON parsing errors become non-cacheable JSON 400 responses', async () => {
  const reply = createReply();
  await handler({
    method: 'POST', headers: { 'content-type': 'application/json' },
    get body() { throw new SyntaxError('Invalid JSON'); },
  }, reply);
  assert.equal(reply.statusCode, 400);
  assert.equal(reply.body.delivered, false);
  assert.equal(reply.headers['Cache-Control'], 'no-store');
});

test('HTTP adapter ends preflight without reading the body', async () => {
  const reply = createReply();
  await handler({
    method: 'OPTIONS', headers: { host: 'review.vercel.app', origin: 'https://review.vercel.app' },
    get body() { return assert.fail('Preflight has no body'); },
  }, reply);
  assert.equal(reply.statusCode, 204);
  assert.equal(reply.ended, true);
  assert.equal(reply.body, undefined);
});
