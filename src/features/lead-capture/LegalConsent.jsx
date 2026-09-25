import { SITE_CONFIG } from '../../config/site.js';

const LegalConsent = ({ className = 'text-gray-500' }) => (
  <p className={`text-center text-xs leading-relaxed ${className}`}>
    By submitting, you consent to being contacted about your enquiry. Review our{' '}
    <a
      href={SITE_CONFIG.legalLinks.privacy}
      className="rounded font-semibold underline underline-offset-2 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
    >
      Privacy Policy
    </a>{' '}
    and{' '}
    <a
      href={SITE_CONFIG.legalLinks.terms}
      className="rounded font-semibold underline underline-offset-2 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
    >
      Terms of Service
    </a>
    .
  </p>
);

export default LegalConsent;
