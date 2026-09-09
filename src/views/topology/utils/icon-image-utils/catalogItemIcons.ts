// Extracted from catalog-item-icon.tsx
// Root: src/views/topology/utils/icon-image-utils/catalog-item-icon.tsx

import { catalogItemIconsFirst } from './catalogItemIconsFirst';
import { catalogItemIconsRest } from './catalogItemIconsRest';

export const logos = new Map<string, string>([...catalogItemIconsFirst, ...catalogItemIconsRest]);
