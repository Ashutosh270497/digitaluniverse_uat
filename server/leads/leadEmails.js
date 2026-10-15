import { BRAND } from '../../shared/brand.js';
import { getRevenueShortLabel } from '../../shared/leadSchema.js';

// Table-based, inline-styled HTML so the emails render in Gmail, Outlook and Apple Mail.
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const C = {
  gold: '#ffd400', gold50: '#fffde9', gold100: '#fff6b8', gold200: '#ffec7a', gold700: '#745500', gold900: '#513b00',
  charcoal: '#17180f', gray900: '#111827', gray700: '#374151', gray600: '#4b5563', gray500: '#6b7280',
  gray200: '#e5e7eb', gray50: '#f9fafb', white: '#ffffff', whatsapp: '#25d366', green700: '#15803d',
};

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const singleLine = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
const digitsOnly = (value) => String(value ?? '').replace(/\D/g, '');
const firstName = (name) => singleLine(name).split(' ')[0];

export const formatReceivedAt = (receivedAt) => `${new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Asia/Kolkata',
}).format(new Date(receivedAt))} IST`;

const FORM_LOCATIONS = { hero: 'Homepage — hero form', contact_page: 'Contact page form' };
const formLabel = (formLocation) => FORM_LOCATIONS[formLocation] || 'Website audit form';
// Both contacts are required; leads from pages loaded before that change may carry only one.
const contactSummary = (lead) => [
  lead.whatsapp ? `WhatsApp ${singleLine(lead.whatsapp)}` : '',
  lead.email ? `email ${lead.email}` : '',
].filter(Boolean).join(' or ');

const page = ({ title, preheader, rows }) => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:${C.gray200};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.gray200};"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:${C.white};border-radius:12px;overflow:hidden;font-family:${FONT};color:${C.gray900};">
${rows.join('\n')}
</table></td></tr></table></body></html>`;

const logoCell = (logoUrl, size = 36) => (logoUrl
  ? `<img src="${escapeHtml(logoUrl)}" width="${size}" height="${size}" alt="" style="display:block;border:0;border-radius:6px;">`
  : `<div style="width:${size}px;height:${size}px;line-height:${size}px;border-radius:6px;background:${C.gold};color:${C.charcoal};font-weight:800;text-align:center;">D</div>`);

const darkHeader = (logoUrl, pill) => `<tr><td style="background:${C.charcoal};padding:18px 28px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="48" valign="middle">${logoCell(logoUrl)}</td>
<td valign="middle" style="font-size:16px;font-weight:700;color:${C.white};">${escapeHtml(BRAND.name)}</td>
<td align="right" valign="middle"><span style="display:inline-block;background:${C.gold};color:${C.charcoal};font-size:11px;font-weight:800;letter-spacing:.08em;padding:5px 10px;border-radius:999px;">${escapeHtml(pill)}</span></td>
</tr></table></td></tr>
<tr><td style="background:${C.gold};height:4px;line-height:4px;font-size:0;">&nbsp;</td></tr>`;

const eyebrow = (text, color = C.gold700) =>
  `<p style="margin:0 0 10px;font-size:12px;font-weight:800;letter-spacing:.08em;color:${color};">${escapeHtml(text)}</p>`;

const button = (href, label, { background, color, border } = {}) =>
  `<a href="${escapeHtml(href)}" style="display:inline-block;background:${background};color:${color};${border ? `border:1px solid ${border};` : ''}font-size:14px;font-weight:700;text-decoration:none;padding:12px 20px;border-radius:8px;margin:0 8px 8px 0;">${escapeHtml(label)}</a>`;

const detailsTable = (rows) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${C.gray200};border-radius:10px;border-collapse:separate;overflow:hidden;margin:4px 0 18px;">
${rows.map(([label, value], index) => `<tr style="background:${index % 2 ? C.white : C.gray50};">
<td width="150" valign="top" style="padding:11px 16px;font-size:13px;font-weight:500;color:${C.gray500};">${escapeHtml(label)}</td>
<td valign="top" style="padding:11px 16px;font-size:14px;font-weight:600;color:${C.gray900};">${escapeHtml(value)}</td></tr>`).join('\n')}
</table>`;

const footer = (lines) => `<tr><td style="background:${C.gray50};padding:18px 32px;font-size:12px;line-height:18px;color:${C.gray500};">${lines.join('<br>')}</td></tr>`;

const contactActions = (lead) => [
  lead.whatsapp ? button(`https://wa.me/${digitsOnly(lead.whatsapp)}`, 'Chat on WhatsApp', { background: C.whatsapp, color: C.white }) : '',
  lead.whatsapp ? button(`tel:+${digitsOnly(lead.whatsapp)}`, `Call ${singleLine(lead.whatsapp)}`, { background: C.white, color: C.charcoal, border: C.gray200 }) : '',
  lead.email ? button(`mailto:${lead.email}?subject=${encodeURIComponent(`Your free Amazon audit — ${BRAND.name}`)}`, 'Reply by email', { background: C.gold, color: C.charcoal }) : '',
].join('');

const leadRows = (lead) => [
  ['Name', singleLine(lead.name)],
  ...(lead.email ? [['Email', lead.email]] : []),
  ...(lead.whatsapp ? [['WhatsApp', singleLine(lead.whatsapp)]] : []),
  ...(lead.monthlyAmazonRevenueRangeLabel
    ? [['Monthly revenue', `${lead.monthlyAmazonRevenueRangeLabel} (${lead.monthlyAmazonRevenueCurrency})`]]
    : []),
  ['Submitted', formatReceivedAt(lead.receivedAt)],
  ['Form', formLabel(lead.formLocation)],
  ['Lead ID', lead.leadId],
];

const detailRows = (described) => [
  ['Store / ASIN', described.storeUrl],
  ['Marketplaces', described.marketplaces],
  ['Seller type', described.sellerType],
  ['Ad spend', described.adSpend ? `${described.adSpend} / month` : ''],
  ['Challenges', described.challenges],
  ['Notes', singleLine(described.notes)],
].filter(([, value]) => value);

const textBlock = (rows) => rows.map(([label, value]) => `${label}: ${value}`).join('\n');

// ---------- E1: new-lead alert to the business ----------
export const renderLeadAlert = (lead, { logoUrl } = {}) => {
  const name = singleLine(lead.name);
  const band = getRevenueShortLabel(lead.monthlyAmazonRevenueCurrency, lead.monthlyAmazonRevenueRange);
  const subject = ['New audit lead: ' + name, band].filter(Boolean).join(' · ');
  const preheader = [singleLine(lead.whatsapp), lead.email, formatReceivedAt(lead.receivedAt)].filter(Boolean).join(' · ');
  const rows = leadRows(lead);

  const html = page({
    title: subject,
    preheader,
    rows: [
      darkHeader(logoUrl, 'NEW LEAD'),
      `<tr><td style="padding:28px 32px 8px;">
${eyebrow('FREE AMAZON AUDIT REQUEST')}
<p style="margin:0 0 10px;font-size:26px;line-height:32px;font-weight:700;color:${C.charcoal};">${escapeHtml(name)}${band ? ` <span style="display:inline-block;vertical-align:middle;background:${C.gold100};color:${C.gold900};font-size:12px;line-height:16px;font-weight:700;padding:5px 10px;border-radius:999px;">${escapeHtml(band)}</span>` : ''}</p>
<p style="margin:0 0 18px;font-size:14px;line-height:21px;color:${C.gray600};">Submitted ${escapeHtml(formatReceivedAt(lead.receivedAt))} from the ${escapeHtml(formLabel(lead.formLocation).toLowerCase())}. Reach them on ${escapeHtml(contactSummary(lead))}.</p>
<div style="margin:0 0 10px;">${contactActions(lead)}</div>
${detailsTable(rows)}
${eyebrow('AUDIT DETAILS (STEP 2)', C.gray500)}
<p style="margin:0 0 24px;font-size:13px;line-height:19px;color:${C.gray500};">Not provided yet. If they add store details, you’ll get a follow-up email with lead ID ${escapeHtml(lead.leadId)}.</p>
</td></tr>`,
      footer([
        `Sent automatically by the lead form on ${escapeHtml(BRAND.canonicalOrigin.replace('https://', ''))}.`,
        lead.email ? 'Tap “Chat on WhatsApp”, or just hit Reply — it goes straight to the visitor.' : 'Tap “Chat on WhatsApp” to message the lead directly.',
      ]),
    ],
  });

  const text = [
    `New free Amazon audit request — ${name}`,
    '',
    textBlock(rows),
    '',
    lead.whatsapp ? `Chat on WhatsApp: https://wa.me/${digitsOnly(lead.whatsapp)}` : '',
    lead.email ? `Reply to this email to answer ${firstName(name)}.` : '',
    'Audit details (Step 2): not provided yet.',
  ].join('\n');

  return { subject, html, text };
};

// ---------- Step 2 follow-up alert to the business ----------
export const renderDetailsAlert = (details, described, { logoUrl } = {}) => {
  const name = singleLine(details.name);
  const subject = `Audit details added: ${name} (${details.leadId})`;
  const rows = detailRows(described);
  const html = page({
    title: subject,
    preheader: `${name} shared store details for lead ${details.leadId}.`,
    rows: [
      darkHeader(logoUrl, 'AUDIT DETAILS'),
      `<tr><td style="padding:28px 32px 8px;">
${eyebrow('STEP 2 · AUDIT DETAILS ADDED')}
<p style="margin:0 0 10px;font-size:26px;line-height:32px;font-weight:700;color:${C.charcoal};">${escapeHtml(name)}</p>
<p style="margin:0 0 18px;font-size:14px;line-height:21px;color:${C.gray600};">Added to lead ${escapeHtml(details.leadId)}. Reach them on ${escapeHtml(contactSummary(details))}.</p>
<div style="margin:0 0 10px;">${contactActions(details)}</div>
${detailsTable(rows)}
</td></tr>`,
      footer([`Sent automatically by the lead form on ${escapeHtml(BRAND.canonicalOrigin.replace('https://', ''))}.`]),
    ],
  });
  const text = [`Audit details added for ${name} (${details.leadId})`, `Reach them on ${contactSummary(details)}.`, '', textBlock(rows)].join('\n');
  return { subject, html, text };
};

// ---------- E2: confirmation to the visitor (email leads only) ----------
export const renderVisitorConfirmation = (lead, { logoUrl } = {}) => {
  const first = firstName(lead.name);
  const subject = 'Your free Amazon audit request is confirmed';
  const preheader = 'Here’s what happens next — and how to reach us on WhatsApp.';
  const whatsappText = encodeURIComponent(`Hi ${BRAND.name}, I just requested a free Amazon audit (${lead.leadId}).`);
  const storeMail = `mailto:${BRAND.contact.email}?subject=${encodeURIComponent(`Store details for my audit (${lead.leadId})`)}`;
  const steps = [
    ['1', 'We review your Amazon account', 'PPC, listings, rankings and account health.'],
    ['2', 'We prepare your audit findings', 'Clear priorities and quick wins for your store.'],
    ['3', lead.whatsapp ? 'We reach out on WhatsApp' : 'We reply by email', 'To walk you through the findings — no obligation.'],
  ];

  const html = page({
    title: subject,
    preheader,
    rows: [
      `<tr><td style="padding:20px 32px;border-bottom:3px solid ${C.gold};">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="48" valign="middle">${logoCell(logoUrl)}</td>
<td valign="middle"><div style="font-size:16px;font-weight:700;color:${C.charcoal};">${escapeHtml(BRAND.name)}</div><div style="font-size:12px;font-weight:500;color:${C.gray500};">Amazon Growth &amp; Performance Partner</div></td>
</tr></table></td></tr>`,
      `<tr><td style="background:${C.gold50};padding:28px 32px;">
<div style="width:48px;height:48px;line-height:48px;border-radius:999px;background:${C.gold};color:${C.charcoal};font-size:24px;font-weight:800;text-align:center;margin:0 0 14px;">&#10003;</div>
<p style="margin:0 0 10px;font-size:24px;line-height:30px;font-weight:700;color:${C.charcoal};">Thanks, ${escapeHtml(first)} — we’ve got your request.</p>
<p style="margin:0;font-size:15px;line-height:23px;color:${C.gray700};">Our team will review your Amazon account and get back to you${lead.whatsapp ? ` on WhatsApp at <strong>${escapeHtml(singleLine(lead.whatsapp))}</strong> and` : ''} by email at <strong>${escapeHtml(lead.email)}</strong>.</p>
</td></tr>`,
      `<tr><td style="padding:28px 32px 8px;">
${eyebrow('WHAT HAPPENS NEXT', C.gray500)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;">
${steps.map(([number, title, desc]) => `<tr><td width="44" valign="top" style="padding:0 0 14px;"><div style="width:32px;height:32px;line-height:32px;border-radius:999px;background:${C.gold100};color:${C.gold900};font-size:14px;font-weight:800;text-align:center;">${number}</div></td>
<td valign="top" style="padding:0 0 14px;"><div style="font-size:15px;line-height:22px;font-weight:700;color:${C.charcoal};">${title}</div><div style="font-size:14px;line-height:20px;color:${C.gray600};">${desc}</div></td></tr>`).join('\n')}
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.gray50};border:1px solid ${C.gray200};border-radius:12px;margin:0 0 20px;"><tr><td style="padding:20px;">
<p style="margin:0 0 6px;font-size:15px;font-weight:700;color:${C.charcoal};">Want a sharper audit?</p>
<p style="margin:0 0 14px;font-size:14px;line-height:21px;color:${C.gray600};">Send us your Amazon store link or a top ASIN — it helps us prepare before we talk.</p>
${button(storeMail, 'Email us your store link', { background: C.gold, color: C.charcoal })}${button(`https://wa.me/${BRAND.contact.whatsappNumber}?text=${whatsappText}`, 'Chat on WhatsApp', { background: C.whatsapp, color: C.white })}
</td></tr></table>
<p style="margin:0 0 18px;font-size:13px;color:${C.gray600};"><span style="color:${C.green700};font-weight:700;">&#10003;</span> We’ll never ask for your Seller Central password.</p>
<p style="margin:0;font-size:14px;font-weight:600;color:${C.charcoal};">— The ${escapeHtml(BRAND.name)} team</p>
<p style="margin:2px 0 24px;font-size:13px;color:${C.gray500};">WhatsApp ${escapeHtml(BRAND.contact.phoneDisplay)} · ${escapeHtml(BRAND.contact.email)}</p>
</td></tr>`,
      footer([
        `You’re receiving this because you requested a free Amazon audit at ${escapeHtml(BRAND.canonicalOrigin.replace('https://', ''))}.`,
        `<a href="${BRAND.canonicalOrigin}/privacy-policy" style="color:${C.gray600};">Privacy Policy</a> · <a href="${BRAND.canonicalOrigin}/terms-of-service" style="color:${C.gray600};">Terms of Service</a>`,
      ]),
    ],
  });

  const text = [
    `Thanks, ${first} — we’ve got your request.`,
    `Our team will review your Amazon account and get back to you${lead.whatsapp ? ` on WhatsApp at ${singleLine(lead.whatsapp)} and` : ''} by email at ${lead.email}.`,
    '',
    'What happens next:',
    ...steps.map(([number, title, desc]) => `${number}. ${title} — ${desc}`),
    '',
    `Want a sharper audit? Email your store link to ${BRAND.contact.email} or chat on WhatsApp: https://wa.me/${BRAND.contact.whatsappNumber}`,
    'We’ll never ask for your Seller Central password.',
    '',
    `— The ${BRAND.name} team`,
  ].join('\n');

  return { subject, html, text };
};
