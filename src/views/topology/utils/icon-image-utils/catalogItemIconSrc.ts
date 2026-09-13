export const toCatalogIconSrc = (src: unknown): string =>
  typeof src === 'string' ? src : String(src);
