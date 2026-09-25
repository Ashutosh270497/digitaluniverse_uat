import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import logo from '../../assets/brand_logos/logo.jpg';
import { SITE_CONFIG } from '../../config/site.js';
import { PRIMARY_NAV_ITEMS } from '../../config/navigation.js';
import { activatePrimaryAuditForm, PRIMARY_CTA_LABEL } from '../../features/lead-capture/primaryCta.js';

const StickyHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handlePrimaryCta = (ctaLocation) => {
    closeMobileMenu();
    activatePrimaryAuditForm({ ctaLocation });
  };

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        globalThis.document?.getElementById('mobile-menu-toggle')?.focus();
      }
    };

    globalThis.document?.addEventListener('keydown', handleEscape);
    return () => globalThis.document?.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-primary-400/25 bg-amazon-dark/95 text-white shadow-lg backdrop-blur-md">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 xl:h-20 xl:px-10"
      >
        <a
          href="#home"
          onClick={closeMobileMenu}
          className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-amazon-dark"
          aria-label={`${SITE_CONFIG.brandName} home`}
        >
          <img
            src={logo}
            alt=""
            width="300"
            height="300"
            className="h-10 w-10 object-contain xl:h-12 xl:w-12"
            aria-hidden="true"
          />
          <span className="hidden text-sm font-extrabold tracking-wide sm:block">
            {SITE_CONFIG.brandName}
          </span>
        </a>

        <div className="hidden items-center gap-0 xl:flex">
          {PRIMARY_NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-lg px-2.5 py-2 text-sm font-semibold text-gray-200 transition-colors hover:bg-white/5 hover:text-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => handlePrimaryCta('sticky_header')}
            className="inline-flex whitespace-nowrap rounded-lg bg-primary-500 px-2.5 py-2.5 text-sm font-extrabold text-amazon-dark shadow-lg transition-colors hover:bg-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-amazon-dark sm:px-5 sm:py-3 sm:text-sm"
          >
            <span className="sm:hidden">Free Amazon Audit</span><span className="hidden sm:inline">{PRIMARY_CTA_LABEL}</span>
          </button>
          <button
            id="mobile-menu-toggle"
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 xl:hidden"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div id="mobile-navigation" className="border-t border-white/10 bg-amazon-dark xl:hidden">
          <nav aria-label="Mobile navigation" className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <div className="grid gap-1">
              {PRIMARY_NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="rounded-lg px-4 py-3 font-semibold text-gray-100 hover:bg-white/5 hover:text-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
                >
                  {item.label}
                </a>
              ))}
              <button
                type="button"
                onClick={() => handlePrimaryCta('mobile_navigation')}
                className="mt-2 rounded-lg bg-primary-500 px-5 py-3 text-left font-extrabold text-amazon-dark hover:bg-primary-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 sm:hidden"
              >
                <span className="sm:hidden">Free Amazon Audit</span><span className="hidden sm:inline">{PRIMARY_CTA_LABEL}</span>
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default StickyHeader;
