// Extracted from catalog-item-icon.tsx
// Root: src/views/topology/utils/icon-image-utils/catalog-item-icon.tsx

export const toCatalogIconSrc = (src: unknown): string =>
  typeof src === 'string' ? src : String(src);
