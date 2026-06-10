import { ROW_FILTERS_PREFIX } from '@kubevirt-utils/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';

/**
 * Migrates legacy filter parameters (starting with rowFilter- prefix) to parameters without the prefix.
 * Useful for ensuring that current saved bookmarks continue to work.
 * @param params - The URL search parameters to migrate.
 * @returns The migrated URL search parameters or null if no legacy parameters are found.
 */
export const migrateLegacyFilterParams = (params: URLSearchParams): null | URLSearchParams => {
  const legacyEntries: [string, string][] = [];

  for (const [key, value] of params.entries()) {
    if (key.startsWith(ROW_FILTERS_PREFIX)) {
      legacyEntries.push([key, value]);
    }
  }

  if (isEmpty(legacyEntries)) return null;

  const migrated = new URLSearchParams(params);

  for (const [key, value] of legacyEntries) {
    const plainKey = key.slice(ROW_FILTERS_PREFIX.length);
    migrated.delete(key);

    if (!params.has(plainKey)) {
      value.split(',').forEach((v) => migrated.append(plainKey, v));
    }
  }

  return migrated;
};
