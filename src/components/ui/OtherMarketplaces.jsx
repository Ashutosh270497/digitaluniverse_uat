import { MARKETPLACE_TRADEMARK_NOTE, OTHER_MARKETPLACES } from '../../content/marketplaces.ts';

const MarketplaceLogo = ({ marketplace, className }) => (
  <img
    src={marketplace.logo}
    alt=""
    width={marketplace.logoWidth}
    height={marketplace.logoHeight}
    decoding="async"
    className={className}
  />
);

// Compact logo chips for dark hero areas.
export const MarketplaceLogoRow = ({ label = 'Also growing brands on' }) => (
  <div className="mt-5" data-other-marketplaces="row">
    <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">{label}</p>
    <ul className="mt-3 flex flex-wrap gap-2.5" aria-label="Other marketplaces we support">
      {OTHER_MARKETPLACES.map((marketplace) => (
        <li key={marketplace.id} className="flex items-center gap-2 rounded-lg bg-white py-1.5 pl-1.5 pr-3">
          <MarketplaceLogo marketplace={marketplace} className="h-7 w-7 rounded object-contain" />
          <span className="text-sm font-bold text-amazon-dark">{marketplace.name}</span>
        </li>
      ))}
    </ul>
  </div>
);

// Cards for the coverage section: Amazon regions above, other marketplaces here.
export const MarketplaceCards = () => (
  <div className="mt-12" data-other-marketplaces="cards">
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-300">Beyond Amazon</p>
        <h3 id="other-marketplaces-heading" className="mt-3 text-2xl font-bold tracking-tight">More marketplaces we support</h3>
      </div>
      <p className="max-w-md text-sm leading-relaxed text-slate-300">Grow on Amazon alongside Flipkart and Meesho in India and TikTok Shop in the US and UK.</p>
    </div>
    <ul className="mt-6 grid gap-4 md:grid-cols-3">
      {OTHER_MARKETPLACES.map((marketplace) => (
        <li key={marketplace.id} className="flex gap-4 rounded-2xl border border-white/15 bg-white/5 p-5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white p-1.5">
            <MarketplaceLogo marketplace={marketplace} className="h-full w-full object-contain" />
          </span>
          <div className="min-w-0">
            <h4 className="font-bold text-white">{marketplace.name}</h4>
            <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-primary-300">{marketplace.regions}</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">{marketplace.summary}</p>
          </div>
        </li>
      ))}
    </ul>
    <p className="mt-4 text-xs leading-relaxed text-slate-400">{MARKETPLACE_TRADEMARK_NOTE}</p>
  </div>
);
