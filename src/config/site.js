import { LEGAL_PATHS } from './routes.js';

export const SPN_SERVICES = [
  { key: 'accountManagement', label: 'Account Management', ref: 'sc_spn_blst_bdt-aa773aa8' },
  { key: 'advertising', label: 'Advertising Optimization', ref: 'sc_spn_alst_adt-aa773aa8' },
  { key: 'enhancedBrandContent', label: 'Enhanced Brand Content', ref: 'sc_spn_ebclst_ebcdt-aa773aa8' },
];

const spnRegions = [
  { code: 'US', label: 'USA' },
  { code: 'UK', label: 'UK' },
  { code: 'IN', label: 'India' },
].map((region) => ({
  ...region,
  links: Object.fromEntries(SPN_SERVICES.map((service) => [
    service.key,
    `https://sellercentral.amazon.in/tsba/provider-details/${encodeURIComponent(service.label)}/aa773aa8-2399-4069-a240-31cf2a209a5d?ref_=${service.ref}&localeSelection=en_US&sellFrom=${region.code}&sellIn=${region.code}`,
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
  // Existing single-market links refer explicitly to India. Cataloguing is
  // retained from the previous site; no replacement was supplied for it.
  spnLinks: {
    ...spnRegions.find((region) => region.code === 'IN').links,
    cataloging:
      'https://sellercentral.amazon.in/gspn/provider-details/Cataloguing/aa773aa8-2399-4069-a240-31cf2a209a5d?ref_=sc_gspn_clst_cdt-aa773aa8&localeSelection=en_US&sellFrom=IN&sellIn=IN',
  },
  legalLinks: LEGAL_PATHS,
};

export const getSpnServiceLinks = (serviceKey) => {
  if (serviceKey === 'cataloging') {
    return [{ code: 'IN', label: 'India', url: SITE_CONFIG.spnLinks.cataloging }];
  }
  return SITE_CONFIG.spnRegions
    .filter((region) => region.links[serviceKey])
    .map((region) => ({ code: region.code, label: region.label, url: region.links[serviceKey] }));
};

export const getWhatsAppUrl = (message = SITE_CONFIG.whatsappDefaultMessage) =>
  `https://wa.me/${SITE_CONFIG.contact.whatsappNumber}?text=${encodeURIComponent(message)}`;

export const getMailtoHref = () => `mailto:${SITE_CONFIG.contact.email}`;

export const getTelHref = (phoneE164 = SITE_CONFIG.contact.phoneE164) => `tel:${phoneE164}`;
