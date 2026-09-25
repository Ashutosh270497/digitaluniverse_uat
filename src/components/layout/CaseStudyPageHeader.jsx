import { ArrowLeft } from 'lucide-react';
import logo from '../../assets/brand_logos/logo.jpg';
import { SITE_CONFIG } from '../../config/site.js';

const CaseStudyPageHeader = () => (
  <header className="border-b border-white/10 bg-amazon-dark text-white">
    <nav
      aria-label="Case study navigation"
      className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10"
    >
      <a
        href="/"
        className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
        aria-label={`${SITE_CONFIG.brandName} home`}
      >
        <img src={logo} alt="" width="300" height="300" className="h-11 w-11 object-contain" aria-hidden="true" />
        <span className="hidden font-black sm:inline">{SITE_CONFIG.brandName}</span>
      </a>
      <a
        href="/#case-studies"
        className="inline-flex items-center gap-2 rounded-lg font-bold text-primary-300 hover:text-primary-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to homepage
      </a>
    </nav>
  </header>
);

export default CaseStudyPageHeader;
