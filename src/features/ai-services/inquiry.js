import { SITE_CONFIG, getWhatsAppUrl } from '../../config/site.js';

export const AI_CONTACT_ID = 'ai-project';
export const getAiContactHref = serviceId => serviceId
  ? `/contact?service=${encodeURIComponent(serviceId)}#${AI_CONTACT_ID}`
  : `/contact#${AI_CONTACT_ID}`;

export const getAiInquiryMessage = (serviceTitle = 'AI solutions') =>
  `Hello Digital Universe Pro, I would like to discuss ${serviceTitle} for my business. Here is what I would like to build or improve: `;

export const getAiWhatsAppUrl = serviceTitle => getWhatsAppUrl(getAiInquiryMessage(serviceTitle));

export const getAiEmailHref = (serviceTitle = 'AI solutions') =>
  `mailto:${SITE_CONFIG.contact.email}?subject=${encodeURIComponent(`AI project enquiry: ${serviceTitle}`)}&body=${encodeURIComponent(getAiInquiryMessage(serviceTitle))}`;
