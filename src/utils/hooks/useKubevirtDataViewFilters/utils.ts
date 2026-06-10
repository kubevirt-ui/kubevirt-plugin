import { ROW_FILTERS_PREFIX } from '@kubevirt-utils/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { EXCLUSION_URL_PREFIX } from '@search/searchLanguage/constants';

import { KubevirtFilter } from './types';

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

export const isExcludedValue = (value: string): boolean => value.startsWith(EXCLUSION_URL_PREFIX);

export const matchesWithExclusion = <T extends K8sResourceCommon>(
  filterDef: KubevirtFilter<T>,
  obj: T,
  selected: string[],
): boolean => {
  const included = selected.filter((v) => !isExcludedValue(v));
  const excluded = selected.filter(isExcludedValue).map((v) => v.slice(1));

  const matchesIncluded = included.length === 0 || filterDef.match(obj, included);
  const matchesExcluded = excluded.length === 0 || !filterDef.match(obj, excluded);

  return matchesIncluded && matchesExcluded;
};

export const formatFilterValue = (value: string, excluded = false): string =>
  excluded ? `${EXCLUSION_URL_PREFIX}${value}` : value;
