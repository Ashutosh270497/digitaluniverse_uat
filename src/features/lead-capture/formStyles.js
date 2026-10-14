// Shared Tailwind class sets for the audit form's inputs, single-select options and multi-select chips.
export const inputClassName = (hasError, { inline = false } = {}) => [
  inline ? 'min-w-0 flex-1' : 'mt-2 w-full',
  'rounded-lg border bg-white px-4 py-3 font-medium text-gray-900 shadow-sm outline-none transition-colors',
  'focus:ring-2 focus:ring-primary-600/30',
  hasError ? 'border-red-600 focus:border-red-600' : 'border-gray-300 focus:border-primary-600',
].join(' ');

export const optionClassName = [
  'flex min-h-12 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-2 py-3',
  'text-sm font-bold text-gray-700 transition-colors',
  'peer-checked:border-primary-700 peer-checked:bg-primary-100 peer-checked:text-primary-900',
  'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-700',
].join(' ');

export const chipClassName = [
  'inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3.5 py-2',
  'text-sm font-semibold text-gray-700 transition-colors',
  'peer-checked:border-primary-700 peer-checked:bg-primary-100 peer-checked:text-primary-900',
  'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary-700',
].join(' ');

export const labelClassName = 'block text-sm font-extrabold text-gray-800';
export const hintClassName = 'mt-1.5 text-sm text-gray-600';
export const errorClassName = 'mt-1.5 text-sm font-semibold text-red-700';
