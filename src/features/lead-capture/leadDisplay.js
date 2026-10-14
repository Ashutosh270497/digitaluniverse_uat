// First name for personalised headings; falls back to a friendly greeting.
export const firstNameOf = (name = '') => name.trim().split(/\s+/)[0] || 'there';
