import anonyoLogo from '../assets/brand_logos/optimized/anonyo.webp';
import auraveLogo from '../assets/brand_logos/optimized/aurave.webp';
import betterThanSugarLogo from '../assets/brand_logos/optimized/bostic-sugar.webp';
import dartlerLogo from '../assets/brand_logos/optimized/dartler.webp';
import eatWaterLogo from '../assets/brand_logos/optimized/eat-water.webp';
import evairLogo from '../assets/brand_logos/optimized/evair.webp';
import giocareLogo from '../assets/brand_logos/optimized/giocare.webp';
import itzNotJustLogo from '../assets/brand_logos/optimized/itz-not-just.webp';
import jasberryLogo from '../assets/brand_logos/optimized/jasberry.webp';
import kadamLogo from '../assets/brand_logos/optimized/kadam.webp';
import ketoChefLogo from '../assets/brand_logos/optimized/keto-chef.webp';
import ketoSkinnyLogo from '../assets/brand_logos/optimized/keto-skinny.webp';
import lickiciousLogo from '../assets/brand_logos/optimized/lickicious.webp';
import mavenWholefoodsLogo from '../assets/brand_logos/optimized/maven-wholefoods.webp';
import pollieByKadamLogo from '../assets/brand_logos/optimized/pollie-by-kadam.webp';
import snaecomLogo from '../assets/brand_logos/optimized/snaecom.webp';
import upsilonLogo from '../assets/brand_logos/optimized/upsilon.webp';
import xoCurlsLogo from '../assets/brand_logos/optimized/xo-curls.webp';

export type ClientRegion = 'India' | 'International';

export interface ClientBrand {
  id: string;
  name: string;
  logo: string;
  logoWidth: number;
  logoHeight: number;
  displayScale?: number;
  region: ClientRegion;
  marketplace: string | null;
  category: string | null;
  featured: boolean;
  testimonialId: string | null;
  caseStudyId: string | null;
  websiteUrl: string | null;
  permissionConfirmed: boolean;
}

// The task brief explicitly authorises continued use of logos already displayed
// on digitaluniversepro.co. Marketplace, category, website, testimonial and
// case-study relationships remain null unless the repository documents them.
export const CLIENT_BRANDS: readonly ClientBrand[] = [
  {
    id: 'anonyo',
    name: 'Anonyo',
    logo: anonyoLogo,
    logoWidth: 480,
    logoHeight: 640,
    region: 'International',
    marketplace: null,
    category: null,
    featured: false,
    testimonialId: null,
    caseStudyId: null,
    websiteUrl: null,
    permissionConfirmed: true,
  },
  {
    id: 'eat-water',
    name: 'Eat Water',
    logo: eatWaterLogo,
    logoWidth: 640,
    logoHeight: 295,
    displayScale: 1.45,
    region: 'International',
    marketplace: null,
    category: null,
    featured: false,
    testimonialId: null,
    caseStudyId: null,
    websiteUrl: null,
    permissionConfirmed: true,
  },
  {
    id: 'keto-chef',
    name: 'Keto Chef',
    logo: ketoChefLogo,
    logoWidth: 600,
    logoHeight: 600,
    displayScale: 1.35,
    region: 'International',
    marketplace: null,
    category: null,
    featured: false,
    testimonialId: null,
    caseStudyId: null,
    websiteUrl: null,
    permissionConfirmed: true,
  },
  {
    id: 'snaecom',
    name: 'SNAeCom',
    logo: snaecomLogo,
    logoWidth: 320,
    logoHeight: 640,
    displayScale: 1.55,
    region: 'International',
    marketplace: null,
    category: null,
    featured: false,
    testimonialId: null,
    caseStudyId: null,
    websiteUrl: null,
    permissionConfirmed: true,
  },
  {
    id: 'evair',
    name: 'Evair',
    logo: evairLogo,
    logoWidth: 600,
    logoHeight: 600,
    displayScale: 1.3,
    region: 'International',
    marketplace: null,
    category: null,
    featured: false,
    testimonialId: null,
    caseStudyId: null,
    websiteUrl: null,
    permissionConfirmed: true,
  },
  {
    id: 'keto-skinny',
    name: 'Keto Skinny',
    logo: ketoSkinnyLogo,
    logoWidth: 400,
    logoHeight: 400,
    displayScale: 1.1,
    region: 'International',
    marketplace: null,
    category: null,
    featured: false,
    testimonialId: null,
    caseStudyId: null,
    websiteUrl: null,
    permissionConfirmed: true,
  },
  {
    id: 'itz-not-just',
    name: 'iTz noT JUST',
    logo: itzNotJustLogo,
    logoWidth: 640,
    logoHeight: 400,
    region: 'International',
    marketplace: null,
    category: null,
    featured: false,
    testimonialId: null,
    caseStudyId: null,
    websiteUrl: null,
    permissionConfirmed: true,
  },
  {
    id: 'maven-wholefoods',
    name: 'Maven Wholefoods',
    logo: mavenWholefoodsLogo,
    logoWidth: 400,
    logoHeight: 400,
    displayScale: 1.4,
    region: 'International',
    marketplace: null,
    category: null,
    featured: false,
    testimonialId: null,
    caseStudyId: null,
    websiteUrl: null,
    permissionConfirmed: true,
  },
  {
    id: 'better-than-sugar',
    name: 'Better Than Sugar',
    logo: betterThanSugarLogo,
    logoWidth: 400,
    logoHeight: 400,
    displayScale: 1.35,
    region: 'International',
    marketplace: null,
    category: null,
    featured: false,
    testimonialId: null,
    caseStudyId: null,
    websiteUrl: null,
    permissionConfirmed: true,
  },
  {
    id: 'xo-curls',
    name: 'XO Curls',
    logo: xoCurlsLogo,
    logoWidth: 640,
    logoHeight: 138,
    displayScale: 1.1,
    region: 'International',
    marketplace: null,
    category: null,
    featured: false,
    testimonialId: null,
    caseStudyId: null,
    websiteUrl: null,
    permissionConfirmed: true,
  },
  {
    id: 'jasberry',
    name: 'Jasberry',
    logo: jasberryLogo,
    logoWidth: 640,
    logoHeight: 640,
    region: 'International',
    marketplace: null,
    category: null,
    featured: true,
    testimonialId: null,
    caseStudyId: null,
    websiteUrl: null,
    permissionConfirmed: true,
  },
  {
    id: 'giocare',
    name: 'Giocare',
    logo: giocareLogo,
    logoWidth: 640,
    logoHeight: 615,
    region: 'India',
    marketplace: null,
    category: null,
    featured: false,
    testimonialId: null,
    caseStudyId: null,
    websiteUrl: null,
    permissionConfirmed: true,
  },
  {
    id: 'dartler',
    name: 'Dartler',
    logo: dartlerLogo,
    logoWidth: 640,
    logoHeight: 300,
    displayScale: 1.1,
    region: 'India',
    marketplace: null,
    category: null,
    featured: false,
    testimonialId: null,
    caseStudyId: null,
    websiteUrl: null,
    permissionConfirmed: true,
  },
  {
    id: 'aurave',
    name: 'Aurave',
    logo: auraveLogo,
    logoWidth: 500,
    logoHeight: 500,
    displayScale: 1.4,
    region: 'India',
    marketplace: null,
    category: null,
    featured: false,
    testimonialId: null,
    caseStudyId: null,
    websiteUrl: null,
    permissionConfirmed: true,
  },
  {
    id: 'pollie-by-kadam',
    name: 'Pollie by Kadam',
    logo: pollieByKadamLogo,
    logoWidth: 400,
    logoHeight: 400,
    displayScale: 1.25,
    region: 'India',
    marketplace: null,
    category: null,
    featured: false,
    testimonialId: null,
    caseStudyId: null,
    websiteUrl: null,
    permissionConfirmed: true,
  },
  {
    id: 'kadam',
    name: 'Kadam',
    logo: kadamLogo,
    logoWidth: 640,
    logoHeight: 192,
    displayScale: 1.15,
    region: 'India',
    marketplace: null,
    category: null,
    featured: true,
    testimonialId: null,
    caseStudyId: null,
    websiteUrl: null,
    permissionConfirmed: true,
  },
  {
    id: 'upsilon',
    name: 'Upsilon',
    logo: upsilonLogo,
    logoWidth: 400,
    logoHeight: 400,
    displayScale: 1.8,
    region: 'India',
    marketplace: null,
    category: null,
    featured: true,
    testimonialId: null,
    caseStudyId: null,
    websiteUrl: null,
    permissionConfirmed: true,
  },
  {
    id: 'lickicious',
    name: 'Lickicious',
    logo: lickiciousLogo,
    logoWidth: 538,
    logoHeight: 640,
    region: 'India',
    marketplace: null,
    category: null,
    featured: true,
    testimonialId: null,
    caseStudyId: null,
    websiteUrl: null,
    permissionConfirmed: true,
  },
];

export interface ClientTestimonial {
  id: string;
  title: string;
  quote: string;
  clientName: string;
  role: string | null;
  brandName: string | null;
  brandId: string | null;
  date: string;
  sourceLabel: string | null;
  sourceUrl: string | null;
  sourceExplanation: string;
  featured: boolean;
}

const legacySourceExplanation =
  'This attribution and date were present on the previously published Digital Universe Pro website; the repository does not contain the original review record.';

// Quotes are carried over verbatim from the previously published homepage. No
// brand, role, logo or review-platform relationship is inferred.
export const CLIENT_TESTIMONIALS: readonly ClientTestimonial[] = [
  {
    id: 'salman-khan-rajat-2025-05-19',
    title: 'Excellent Work',
    clientName: 'Salman Khan & Rajat',
    role: null,
    brandName: null,
    brandId: null,
    date: '2025-05-19',
    sourceLabel: null,
    sourceUrl: null,
    sourceExplanation: legacySourceExplanation,
    featured: false,
    quote:
      'We have been working with the Amazon account management team for the past few days and the experience has been great. The team provided expert guidance on catalogue optimisation, buy box strategies and listing SEO, which significantly increased our product visibility and conversions.',
  },
  {
    id: 'suveba-sayed-2025-04-14',
    title: 'Recommended',
    clientName: 'Suveba Sayed',
    role: null,
    brandName: null,
    brandId: null,
    date: '2025-04-14',
    sourceLabel: null,
    sourceUrl: null,
    sourceExplanation: legacySourceExplanation,
    featured: true,
    quote:
      'Digital Universe offers reliable, vetted experts for account management, making it easier for my brand to scale and resolve issues efficiently. Service quality is awesome with instant solutions and expert management...would definitely recommend.',
  },
  {
    id: 'ss-2025-06-22',
    title: 'Focused & Result-Oriented Performance Marketing Team',
    clientName: 'SS',
    role: null,
    brandName: null,
    brandId: null,
    date: '2025-06-22',
    sourceLabel: null,
    sourceUrl: null,
    sourceExplanation: legacySourceExplanation,
    featured: true,
    quote:
      "Working with DIGITAL UNIVERSE has been a great experience. Gautam's performance marketing strategies are data-driven and very effective. We saw noticeable improvement in sales while keeping ACOS and TACOS well under control. The team is professional, responsive, and truly focused on delivering results.",
  },
  {
    id: 'vatsal-vachhani-2025-05-20',
    title: 'Consistent Sales Growth Month Over Month',
    clientName: 'Vatsal Vachhani',
    role: null,
    brandName: null,
    brandId: null,
    date: '2025-05-20',
    sourceLabel: null,
    sourceUrl: null,
    sourceExplanation: legacySourceExplanation,
    featured: true,
    quote:
      'Digital Universe has exceeded our expectations when it comes to overall performance. Beyond managing ads, their team provided full support - from listing optimization and keyword strategy to analytics and growth planning. The results speak for themselves: our sales have grown consistently month-over-month while keeping TACOS under control. Their strategic thinking, transparency, and hands-on execution make them a reliable long-term partner for any brand aiming to grow on Amazon.',
  },
];

export const getApprovedClientBrands = (): readonly ClientBrand[] =>
  CLIENT_BRANDS.filter((brand) => brand.permissionConfirmed);

export const getApprovedClientBrandsByRegion = (
  region: ClientRegion,
): readonly ClientBrand[] =>
  getApprovedClientBrands().filter((brand) => brand.region === region);

export const getFeaturedClientBrands = (limit = 4): readonly ClientBrand[] =>
  getApprovedClientBrands()
    .filter((brand) => brand.featured)
    .slice(0, Math.max(0, limit));

export const getFeaturedTestimonials = (limit = 3): readonly ClientTestimonial[] =>
  CLIENT_TESTIMONIALS.filter((testimonial) => testimonial.featured).slice(
    0,
    Math.max(0, limit),
  );

export const getTestimonialById = (id: string): ClientTestimonial | null =>
  CLIENT_TESTIMONIALS.find((testimonial) => testimonial.id === id) ?? null;
