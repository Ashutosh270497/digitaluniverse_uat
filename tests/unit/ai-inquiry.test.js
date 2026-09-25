import test from 'node:test';
import assert from 'node:assert/strict';
import { getAiContactHref, getAiWhatsAppUrl, getAiEmailHref } from '../../src/features/ai-services/inquiry.js';
import { SITE_CONFIG } from '../../src/config/site.js';

test('AI service enquiries go to the AI contact area and preserve the service selection', () => {
  const url = new URL(getAiContactHref('rag-knowledge-systems'), 'https://example.com');
  assert.equal(url.pathname, '/contact');
  assert.equal(url.hash, '#ai-project');
  assert.equal(url.searchParams.get('service'), 'rag-knowledge-systems');
  assert.equal(getAiContactHref(), '/contact#ai-project');
});

test('AI WhatsApp messages preserve the selected service and use the configured business number', () => {
  const url = new URL(getAiWhatsAppUrl('RAG & Knowledge Systems'));
  assert.equal(url.hostname, 'wa.me');
  assert.equal(url.pathname, `/${SITE_CONFIG.contact.whatsappNumber}`);
  assert.match(url.searchParams.get('text'), /RAG & Knowledge Systems/);
  assert.doesNotMatch(url.searchParams.get('text'), /Amazon audit/);
});

test('AI email subject and body are encoded and the general enquiry has meaningful defaults', () => {
  const url = new URL(getAiEmailHref('MLOps & AI Infrastructure'));
  assert.equal(url.pathname, SITE_CONFIG.contact.email);
  assert.equal(url.searchParams.get('subject'), 'AI project enquiry: MLOps & AI Infrastructure');
  assert.match(url.searchParams.get('body'), /MLOps & AI Infrastructure/);
  assert.match(new URL(getAiEmailHref()).searchParams.get('subject'), /AI solutions/);
});
