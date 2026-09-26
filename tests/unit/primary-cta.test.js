import test from 'node:test';
import assert from 'node:assert/strict';
import {
  activatePrimaryAuditForm,
  focusPrimaryAuditFormFromHash,
  getScrollBehavior,
  PRIMARY_AUDIT_FIRST_FIELD_ID,
  PRIMARY_AUDIT_FORM_ID,
  PRIMARY_AUDIT_ROUTE,
  PRIMARY_CTA_LABEL,
  SECONDARY_CTA_HREF,
  SECONDARY_CTA_LABEL,
} from '../../src/features/lead-capture/primaryCta.js';

const createEnvironment = ({ reducedMotion = false, includeForm = true, includeField = true } = {}) => {
  const scrollCalls = [];
  const focusCalls = [];
  const form = { scrollIntoView: (options) => scrollCalls.push(options) };
  const firstField = { focus: (options) => focusCalls.push(options) };
  const documentObject = {
    getElementById: (id) => {
      if (id === PRIMARY_AUDIT_FORM_ID) return includeForm ? form : null;
      if (id === PRIMARY_AUDIT_FIRST_FIELD_ID) return includeField ? firstField : null;
      return null;
    },
  };
  const windowObject = {
    matchMedia: (query) => ({
      matches: reducedMotion,
      media: query,
    }),
  };

  return { documentObject, windowObject, scrollCalls, focusCalls };
};

test('uses one canonical CTA label and hero-form target', () => {
  assert.equal(PRIMARY_CTA_LABEL, 'Request My Free Amazon Audit');
  assert.equal(SECONDARY_CTA_LABEL, 'Explore Our SPN Page');
  assert.equal(SECONDARY_CTA_HREF, '/amazon-spn');
  assert.equal(PRIMARY_AUDIT_FORM_ID, 'primary-audit-form');
  assert.equal(PRIMARY_AUDIT_FIRST_FIELD_ID, 'primary-audit-name');
  assert.equal(PRIMARY_AUDIT_ROUTE, '/contact#primary-audit-form');
});

test('a canonical cross-page hash focuses the first audit field', () => {
  const environment = createEnvironment({ reducedMotion: true });
  environment.windowObject.location = { hash: `#${PRIMARY_AUDIT_FORM_ID}` };

  assert.equal(focusPrimaryAuditFormFromHash(environment), true);
  assert.deepEqual(environment.scrollCalls, [{ behavior: 'auto', block: 'start' }]);
  assert.deepEqual(environment.focusCalls, [{ preventScroll: true }]);
});

test('scrolls smoothly to the primary audit form and focuses its first field', () => {
  const environment = createEnvironment();

  assert.equal(activatePrimaryAuditForm(environment), true);
  assert.deepEqual(environment.scrollCalls, [{ behavior: 'smooth', block: 'start' }]);
  assert.deepEqual(environment.focusCalls, [{ preventScroll: true }]);
});

test('uses immediate scrolling when reduced motion is requested', () => {
  const environment = createEnvironment({ reducedMotion: true });

  assert.equal(getScrollBehavior(environment.windowObject), 'auto');
  assert.equal(activatePrimaryAuditForm(environment), true);
  assert.deepEqual(environment.scrollCalls, [{ behavior: 'auto', block: 'start' }]);
  assert.deepEqual(environment.focusCalls, [{ preventScroll: true }]);
});

test('fails safely without scrolling or focusing when the target is incomplete', () => {
  const missingForm = createEnvironment({ includeForm: false });
  const missingField = createEnvironment({ includeField: false });

  assert.equal(activatePrimaryAuditForm(missingForm), false);
  assert.equal(activatePrimaryAuditForm(missingField), false);
  assert.deepEqual(missingForm.scrollCalls, []);
  assert.deepEqual(missingField.focusCalls, []);
});
