import test from 'node:test';
import assert from 'node:assert/strict';
import { LeadSubmissionError, submitLeadRequest } from '../../src/features/lead-capture/submitLead.js';

const payload = {
  name: 'A Seller',
  contactMethod: 'email',
  contact: 'seller@example.com',
  amazonUrl: 'https://www.amazon.com/dp/B0EXAMPLE1',
  monthlyRevenue: '10k-50k',
};

test('client rejects unsafe or ambiguous endpoints before sending personal data', async () => {
  for (const endpoint of ['', '//other.test/leads', '/\\other.test/leads', ' /api/leads',
    'http://api.test/leads', 'https://user:password@api.test/leads', 'javascript:alert(1)']) {
    await assert.rejects(submitLeadRequest({ endpoint, payload, fetchImpl: () => assert.fail('must not send') }),
      LeadSubmissionError, endpoint);
  }
});

test('client aborts a stalled request and reports unconfirmed delivery', async () => {
  await assert.rejects(submitLeadRequest({
    endpoint: '/api/leads', payload, timeoutMs: 10,
    fetchImpl: (_url, { signal, redirect }) => {
      assert.equal(redirect, 'error');
      return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted'))));
    },
  }), /could not confirm delivery/);
});

test('client rejects an HTML response from a misconfigured static host', async () => {
  await assert.rejects(submitLeadRequest({
    endpoint: '/api/leads', payload,
    fetchImpl: async () => ({ ok: true, status: 200, json: async () => { throw new Error('HTML'); } }),
  }), /could not confirm delivery/);
});

test('client sends lead information in a POST body, never in the URL', async () => {
  let request;
  const result = await submitLeadRequest({
    endpoint: 'https://api.example.test/leads',
    payload,
    fetchImpl: async (url, options) => {
      request = { url, options };
      return {
        ok: true,
        status: 200,
        json: async () => ({ delivered: true, message: 'Received.' }),
      };
    },
  });

  assert.equal(result.delivered, true);
  assert.equal(request.url, 'https://api.example.test/leads');
  assert.equal(request.options.method, 'POST');
  assert.deepEqual(JSON.parse(request.options.body), payload);
  assert.equal(new URL(request.url).search, '');
});

test('client never treats a backend server error as success', async () => {
  await assert.rejects(
    submitLeadRequest({
      endpoint: '/api/leads',
      payload,
      fetchImpl: async () => ({
        ok: false,
        status: 500,
        json: async () => ({ delivered: false, message: 'Delivery failed.' }),
      }),
    }),
    (error) => error instanceof LeadSubmissionError && error.message === 'Delivery failed.',
  );
});

test('client rejects a nominal 200 response without delivery acknowledgement', async () => {
  await assert.rejects(
    submitLeadRequest({
      endpoint: '/api/leads',
      payload,
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        json: async () => ({ delivered: false }),
      }),
    }),
    LeadSubmissionError,
  );
});
