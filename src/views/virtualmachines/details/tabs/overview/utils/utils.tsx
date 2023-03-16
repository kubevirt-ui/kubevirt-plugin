export const createURL = (append: string, url: string): string =>
  url?.endsWith('/') ? `${url}${append}` : `${url}/${append}`;
