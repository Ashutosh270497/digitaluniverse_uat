import { ArrowRight, ExternalLink } from 'lucide-react';
import adsBadge from '../../assets/amazon_pics/amazon_ads_badge.jpeg';
import spnBadge from '../../assets/amazon_pics/amazon_spn_badge.jpeg';
import { SITE_CONFIG } from '../../config/site.js';
import { AMAZON_SPN_DIRECTORY_HREF, revealAmazonSpnDirectory } from './amazonPartnerNavigation.js';

const badges = {
  ads: { src: adsBadge, width: 1600, height: 1220, title: 'Amazon Ads Verified Partner', label: 'View partner profile', href: SITE_CONFIG.amazonAdsPartnerUrl },
  spn: { src: spnBadge, width: 1024, height: 1024, title: 'Amazon Service Provider Network', label: 'USA · UK · India', href: AMAZON_SPN_DIRECTORY_HREF },
};

export const AmazonPartnerBadgeImage = ({ kind, className = '', priority = false, decorative = false }) => {
  const badge = badges[kind];
  return (
    <img
      src={badge.src}
      alt={decorative ? '' : badge.title}
      width={badge.width}
      height={badge.height}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={`object-contain ${className}`}
    />
  );
};

const AmazonPartnerBadge = ({ kind, href, label, compact = false, priority = false, className = '' }) => {
  const badge = badges[kind];
  const destination = href ?? badge.href;
  const caption = label ?? badge.label;
  const external = destination.startsWith('https://');
  const LinkIcon = external ? ExternalLink : ArrowRight;

  return (
    <a
      href={destination}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      onClick={destination === AMAZON_SPN_DIRECTORY_HREF ? revealAmazonSpnDirectory : undefined}
      aria-label={`${badge.title} — ${caption}${external ? ' (opens in a new tab)' : ' — view service listings'}`}
      data-amazon-partner-badge={kind}
      className={`${compact ? 'inline-flex items-center gap-3 p-2' : 'flex w-full flex-col'} max-w-full overflow-hidden rounded-xl border border-gray-200 bg-white text-amazon-dark transition-colors hover:border-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-primary-700 ${className}`}
    >
      <span className={compact ? 'flex h-16 w-20 shrink-0 items-center justify-center' : 'flex h-24 items-center justify-center px-2 sm:h-28'}>
        <AmazonPartnerBadgeImage kind={kind} priority={priority} decorative className="h-full w-full" />
      </span>
      <span className={`flex min-h-11 items-center justify-between gap-2 text-xs font-bold leading-snug ${compact ? 'min-w-0 py-1 pr-2' : 'border-t border-gray-100 px-3 py-2'}`}>
        {caption}<LinkIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      </span>
    </a>
  );
};

export const AmazonPartnerBadges = ({ className = '', priority = false }) => (
  <div className={`grid w-full max-w-[22rem] grid-cols-2 gap-3 ${className}`} role="group" aria-label="Amazon partner credentials">
    <AmazonPartnerBadge kind="ads" priority={priority} />
    <AmazonPartnerBadge kind="spn" priority={priority} />
  </div>
);

export default AmazonPartnerBadge;
