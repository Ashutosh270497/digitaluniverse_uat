import logo from '../../assets/brand_logos/logo.jpg';
import { MARKETING_ROUTES } from '../../config/routes.js';
import { SITE_CONFIG } from '../../config/site.js';

const internalLinks = [
  ['Amazon PPC', MARKETING_ROUTES.amazonPpcManagement.path],
  ['Account Management', MARKETING_ROUTES.amazonAccountManagement.path],
  ['AI Services', '/#ai-services'],
  ['Results', '/case-studies'],
  ['About', MARKETING_ROUTES.about.path],
  ['Contact', MARKETING_ROUTES.contact.path],
];

const InternalPageHeader = () => (
  <header className="border-b border-white/10 bg-amazon-dark text-white">
    <nav
      aria-label="Primary navigation"
      className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10"
    >
      <a
        href="/"
        className="inline-flex items-center gap-3 self-start rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
        aria-label={`${SITE_CONFIG.brandName} home`}
      >
        <img src={logo} alt="" width="300" height="300" className="h-11 w-11 object-contain" aria-hidden="true" />
        <span className="font-black">{SITE_CONFIG.brandName}</span>
      </a>
      <ul className="flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold text-gray-200">
        {internalLinks.map(([label, href]) => (
          <li key={href}>
            <a
              href={href}
              className="rounded hover:text-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  </header>
);

export default InternalPageHeader;
