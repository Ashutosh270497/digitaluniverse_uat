// Country codes offered next to the WhatsApp number. "Other" lets visitors type the full number.
export const DIAL_CODES = Object.freeze([
  { code: '+91', flag: '🇮🇳', country: 'India' },
  { code: '+1', flag: '🇺🇸', country: 'United States or Canada' },
  { code: '+44', flag: '🇬🇧', country: 'United Kingdom' },
  { code: '+971', flag: '🇦🇪', country: 'United Arab Emirates' },
  { code: '+966', flag: '🇸🇦', country: 'Saudi Arabia' },
  { code: '+61', flag: '🇦🇺', country: 'Australia' },
  { code: '+65', flag: '🇸🇬', country: 'Singapore' },
  { code: '+49', flag: '🇩🇪', country: 'Germany' },
  { code: '+33', flag: '🇫🇷', country: 'France' },
  { code: '+39', flag: '🇮🇹', country: 'Italy' },
  { code: '+34', flag: '🇪🇸', country: 'Spain' },
  { code: '+31', flag: '🇳🇱', country: 'Netherlands' },
  { code: '+81', flag: '🇯🇵', country: 'Japan' },
  { code: '+52', flag: '🇲🇽', country: 'Mexico' },
  { code: '+55', flag: '🇧🇷', country: 'Brazil' },
  { code: '', flag: '🌍', country: 'Other' },
]);

export const DEFAULT_DIAL_CODE = '+91';

// Joins the picker and the typed number; a number typed with its own "+" code wins.
export const composeWhatsAppNumber = (dialCode, number) => {
  const typed = String(number ?? '').trim();
  if (!typed || typed.startsWith('+') || !dialCode) return typed;
  return `${dialCode} ${typed.replace(/^0+/, '')}`;
};
