import flipkartLogo from '../assets/marketplaces/flipkart.webp';
import meeshoLogo from '../assets/marketplaces/meesho.webp';
import tiktokShopLogo from '../assets/marketplaces/tiktok-shop.webp';

export type OtherMarketplaceId = 'flipkart' | 'meesho' | 'tiktok-shop';

export interface SupportedMarketplace {
  id: OtherMarketplaceId;
  name: string;
  regions: string;
  summary: string;
  logo: string;
  logoWidth: number;
  logoHeight: number;
}

// Marketplaces supported alongside Amazon. Logos are owner trademarks, shown without implying partnership.
export const OTHER_MARKETPLACES: readonly SupportedMarketplace[] = [
  {
    id: 'flipkart',
    name: 'Flipkart',
    regions: 'India',
    summary: 'Catalog, listing and account growth support for Flipkart sellers.',
    logo: flipkartLogo,
    logoWidth: 160,
    logoHeight: 160,
  },
  {
    id: 'meesho',
    name: 'Meesho',
    regions: 'India',
    summary: 'Catalog, pricing and account growth support for Meesho sellers.',
    logo: meeshoLogo,
    logoWidth: 160,
    logoHeight: 160,
  },
  {
    id: 'tiktok-shop',
    name: 'TikTok Shop',
    regions: 'US & UK',
    summary: 'Shop setup, product listings and growth support for TikTok Shop sellers.',
    logo: tiktokShopLogo,
    logoWidth: 157,
    logoHeight: 160,
  },
];

export const MARKETPLACE_TRADEMARK_NOTE =
  'Flipkart, Meesho and TikTok Shop names and logos are trademarks of their respective owners. They are shown to indicate marketplaces we support and do not imply affiliation or endorsement.';

export const getMarketplaceLogo = (id: string) => OTHER_MARKETPLACES.find((marketplace) => marketplace.id === id) ?? null;
