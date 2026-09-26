import { Facebook, Instagram, Linkedin, Mail, Phone, Youtube } from 'lucide-react';
import logo from '../../assets/brand_logos/logo.jpg';
import { AmazonPartnerBadges } from '../ui/AmazonPartnerBadge.jsx';
import { getHomepageHref, PRIMARY_NAV_ITEMS } from '../../config/navigation.js';
import { MARKETING_ROUTES } from '../../config/routes.js';
import { SITE_CONFIG, getMailtoHref, getTelHref } from '../../config/site.js';
import {
  ANALYTICS_CONFIG,
  openAnalyticsPreferences,
  trackContactClick,
} from '../../analytics/index.js';

const serviceLinks = [
  ['Amazon PPC Management', MARKETING_ROUTES.amazonPpcManagement.path],
  ['Account Management', MARKETING_ROUTES.amazonAccountManagement.path],
  ['Listing Optimization', MARKETING_ROUTES.amazonListingOptimization.path],
  ['A+ & Brand Content', MARKETING_ROUTES.amazonAPlusContent.path],
  ['Global Selling', MARKETING_ROUTES.amazonGlobalSelling.path],
  ['Amazon SPN Listings', MARKETING_ROUTES.amazonSpn.path],
  ['AI Solutions', MARKETING_ROUTES.aiServices.path],
];

const socialIconMap = {
  Facebook,
  LinkedIn: Linkedin,
  Instagram,
  YouTube: Youtube,
};

const Footer = () => (
  <footer className="border-t-4 border-primary-500 bg-[#11120c] text-gray-300">
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-10 lg:py-16">
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.9fr_1.1fr]">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt=""
              width="300"
              height="300"
              className="h-12 w-12 object-contain"
              aria-hidden="true"
            />
            <p className="font-black text-white">{SITE_CONFIG.brandName}</p>
          </div>
          <p className="mt-5 max-w-sm leading-relaxed text-gray-400">
            Amazon growth and AI solutions for businesses ready to build, automate and scale.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {SITE_CONFIG.socialLinks.map((social) => {
              const Icon = socialIconMap[social.name];
              if (!Icon) return null;

              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.ariaLabel}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 text-gray-300 hover:border-primary-400 hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </a>
              );
            })}
          </div>
          <AmazonPartnerBadges className="mt-6" />
        </div>

        <div>
          <h2 className="font-extrabold text-white">Navigate</h2>
          <ul className="mt-5 space-y-3">
            {PRIMARY_NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a href={getHomepageHref(item.href)} className="hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400">
                  {item.label}
                </a>
              </li>
            ))}
            <li><a href="/#growth-calculator" className="hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400">Growth Calculator</a></li>
          </ul>
        </div>

        <div>
          <h2 className="font-extrabold text-white">Services</h2>
          <ul className="mt-5 space-y-3 text-gray-400">
            {serviceLinks.map(([label, href]) => (
              <li key={href}>
                <a href={href} className="hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-extrabold text-white">Contact</h2>
          <div className="mt-5 space-y-4">
            <a
              href={getMailtoHref()}
              onClick={() => trackContactClick('email', 'footer')}
              className="flex items-start gap-3 break-all hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary-400" aria-hidden="true" />
              {SITE_CONFIG.contact.email}
            </a>
            <a
              href={getTelHref()}
              onClick={() => trackContactClick('phone', 'footer_primary')}
              className="flex items-center gap-3 hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
              <Phone className="h-5 w-5 shrink-0 text-primary-400" aria-hidden="true" />
              {SITE_CONFIG.contact.phoneDisplay}
            </a>
            <a
              href={getTelHref(SITE_CONFIG.contact.secondaryPhoneE164)}
              onClick={() => trackContactClick('phone', 'footer_secondary')}
              className="flex items-center gap-3 hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
              <Phone className="h-5 w-5 shrink-0 text-primary-400" aria-hidden="true" />
              {SITE_CONFIG.contact.secondaryPhoneDisplay}
            </a>
            <p className="text-gray-400">{SITE_CONFIG.contact.address}</p>
          </div>
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-5 border-t border-white/10 pt-7 text-sm text-gray-300 md:flex-row md:items-center md:justify-between">
        <p>© 2026 Digital Universe Pro. All rights reserved.</p>
        <nav aria-label="Legal navigation">
          <ul className="flex flex-wrap gap-x-6 gap-y-3">
            <li><a href={SITE_CONFIG.legalLinks.privacy} className="rounded hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400">Privacy Policy</a></li>
            <li><a href={SITE_CONFIG.legalLinks.terms} className="rounded hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400">Terms of Service</a></li>
            <li><a href={SITE_CONFIG.legalLinks.cookie} className="rounded hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400">Cookie Policy</a></li>
            {ANALYTICS_CONFIG.enabled && (
              <li>
                <button
                  type="button"
                  onClick={openAnalyticsPreferences}
                  className="rounded text-left hover:text-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                >
                  Cookie settings
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </div>
  </footer>
);

export default Footer;
