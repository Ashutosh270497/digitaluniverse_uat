import { LEGAL_PATHS } from './routes.js';

export const SPN_SERVICES = [
  { key: 'accountManagement', label: 'Account Management', path: 'gspn', ref: 'sc_gspn_blst_bdt-aa773aa8' },
  { key: 'advertising', label: 'Advertising Optimization', path: 'gspn', ref: 'sc_gspn_alst_adt-aa773aa8' },
  { key: 'cataloging', label: 'Cataloguing', path: 'gspn', ref: 'sc_gspn_clst_cdt-aa773aa8' },
  { key: 'enhancedBrandContent', label: 'Enhanced Brand Content', path: 'tsba', ref: 'sc_spn_ebclst_ebcdt-aa773aa8' },
];

export const SPN_INDIA_SERVICES = [
  { key: 'accountManagement', label: 'Account Management', directoryLabel: 'Account Management', ref: 'sc_gspn_blst_bdt-aa773aa8' },
  { key: 'advertising', label: 'Advertising', directoryLabel: 'Advertising Optimization', ref: 'sc_gspn_alst_adt-aa773aa8' },
  { key: 'cataloging', label: 'Cataloging', directoryLabel: 'Cataloguing', ref: 'sc_gspn_clst_cdt-aa773aa8' },
  { key: 'enhancedBrandContent', label: 'Enhanced Brand Content', directoryLabel: 'Enhanced Brand Content', ref: 'sc_gspn_ebclst_ebcdt-aa773aa8' },
].map(service => ({
  ...service,
  url: `https://sellercentral.amazon.in/gspn/provider-details/${encodeURIComponent(service.directoryLabel)}/aa773aa8-2399-4069-a240-31cf2a209a5d?ref_=${service.ref}&localeSelection=en_US&sellFrom=IN&sellIn=IN`,
}));

const spnRegions = [
  { code: 'US', label: 'USA' },
  { code: 'UK', label: 'UK' },
  { code: 'IN', label: 'India' },
].map((region) => ({
  ...region,
  links: region.code === 'IN'
    ? Object.fromEntries(SPN_INDIA_SERVICES.map(service => [service.key, service.url]))
    : Object.fromEntries(SPN_SERVICES.map((service) => [
      service.key,
      `https://sellercentral.amazon.in/${service.path}/provider-details/${encodeURIComponent(service.label)}/aa773aa8-2399-4069-a240-31cf2a209a5d?ref_=${service.ref}&localeSelection=en_US&sellFrom=${region.code}&sellIn=${region.code}`,
    ])),
}));

export const SITE_CONFIG = {
  brandName: 'Digital Universe Pro',
  canonicalOrigin: 'https://digitaluniversepro.co',
  contact: {
    email: 'support@digitaluniversepro.co',
    phoneDisplay: '+91 63871 04378',
    phoneE164: '+916387104378',
    secondaryPhoneDisplay: '+91 92080 24236',
    secondaryPhoneE164: '+919208024236',
    whatsappNumber: '916387104378',
    address: 'India',
  },
  whatsappDefaultMessage: 'Hello, I am interested in your Amazon agency services.',
  socialLinks: [
    {
      name: 'Facebook',
      url: 'https://www.facebook.com/people/Digital-Universe/100095308834069/',
      ariaLabel: 'Visit Digital Universe Pro on Facebook',
    },
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/company/digital-universe-pro/',
      ariaLabel: 'Visit Digital Universe Pro on LinkedIn',
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/digitaluniversepro.co/',
      ariaLabel: 'Visit Digital Universe Pro on Instagram',
    },
    {
      name: 'YouTube',
      url: 'https://www.youtube.com/@Prodigitaluniverse',
      ariaLabel: 'Visit Digital Universe Pro on YouTube',
    },
  ],
  amazonAdsPartnerUrl:
    'https://advertising.amazon.com/partners/directory/details/amzn1.ads1.ma1.6l6hpvsylhggfceurmgxhx6k0/DIGITAL-UNIVERSE?sref_=suggestion',
  spnRegions,
  // Single-market links use the founder-supplied India GSPN listings.
  spnLinks: {
    ...spnRegions.find((region) => region.code === 'IN').links,
  },
  legalLinks: LEGAL_PATHS,
};

export const getSpnServiceLinks = (serviceKey) => {
  return SITE_CONFIG.spnRegions
    .filter((region) => region.links[serviceKey])
    .map((region) => ({ code: region.code, label: region.label, url: region.links[serviceKey] }));
};

export const getWhatsAppUrl = (message = SITE_CONFIG.whatsappDefaultMessage) =>
  `https://wa.me/${SITE_CONFIG.contact.whatsappNumber}?text=${encodeURIComponent(message)}`;

export const getMailtoHref = () => `mailto:${SITE_CONFIG.contact.email}`;

export const getTelHref = (phoneE164 = SITE_CONFIG.contact.phoneE164) => `tel:${phoneE164}`;
