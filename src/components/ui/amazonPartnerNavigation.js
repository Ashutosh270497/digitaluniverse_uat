export const AMAZON_SPN_DIRECTORY_HREF = '/#amazon-credentials';

export const revealAmazonSpnDirectory = (event) => {
  // Keep modified clicks and new-tab navigation native.
  if (event?.defaultPrevented || event?.metaKey || event?.ctrlKey || event?.shiftKey || event?.altKey) return;
  const directory = globalThis.document?.querySelector('#amazon-credentials details');
  if (!directory) return;
  directory.open = true;
  directory.querySelector('summary')?.focus({ preventScroll: true });
};
