import { useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { SITE_CONFIG, SPN_SERVICES } from '../../../config/site.js';
import { AmazonPartnerBadgeImage } from '../../../components/ui/AmazonPartnerBadge.jsx';
import { revealAmazonSpnDirectory } from '../../../components/ui/amazonPartnerNavigation.js';

const AmazonTrustBar = () => {
  useEffect(() => {
    const revealFromHash = () => {
      if (window.location.hash === '#amazon-credentials') revealAmazonSpnDirectory();
    };
    revealFromHash();
    window.addEventListener('hashchange', revealFromHash);
    return () => window.removeEventListener('hashchange', revealFromHash);
  }, []);

  return (
    <section id="amazon-credentials" aria-labelledby="amazon-spn-heading" className="scroll-mt-24 border-b border-gray-200 bg-white py-6">
      <div className="section-shell">
        <details className="group">
          <summary className="flex min-h-12 cursor-pointer list-none flex-wrap items-center justify-between gap-3 rounded-lg [&::-webkit-details-marker]:hidden">
            <span className="flex items-center gap-3"><AmazonPartnerBadgeImage kind="spn" decorative className="h-16 w-20 shrink-0 rounded-lg border border-gray-200 bg-white" /><span id="amazon-spn-heading" className="font-bold text-amazon-dark">Listed on Amazon’s Service Provider Network</span></span>
            <span className="flex items-center gap-4 text-sm font-semibold text-primary-800">USA · UK · India<span className="text-xl group-open:rotate-45" aria-hidden="true">+</span></span>
          </summary>
          <div className="grid gap-4 pb-2 pt-5 md:grid-cols-3">
            {SITE_CONFIG.spnRegions.map(region => (
              <div key={region.code} id={`amazon-spn-${region.code.toLowerCase()}`} className="scroll-mt-24 rounded-xl border border-gray-200 p-5">
                <h3 className="font-bold text-amazon-dark">Amazon SPN — {region.label}</h3>
                <ul className="mt-2 space-y-1">
                  {SPN_SERVICES.map(service => (
                    <li key={service.key}><a href={region.links[service.key]} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded text-sm font-semibold text-primary-800 underline underline-offset-4 hover:text-primary-900">{service.label}<ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span className="sr-only"> — {region.label} (opens in a new tab)</span></a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>
      </div>
    </section>
  );
};
export default AmazonTrustBar;
