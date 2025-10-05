// File Overview: This module belongs to src/utils/open-in-new-tab.ts.
// https://stackoverflow.com/a/28374344
export const openInNewTab = (href: string): void => {
  Object.assign(document.createElement('a'), {
    target: '_blank',
    rel: 'noopener noreferrer',
    href: href
  }).click();
};
