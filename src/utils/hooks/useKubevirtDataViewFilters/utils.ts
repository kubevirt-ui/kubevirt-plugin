import { ROW_FILTERS_PREFIX } from '@kubevirt-utils/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { EXCLUSION_URL_PREFIX } from '@search/searchLanguage/constants';

import { type FilterableObject, type KubevirtFilter, KubevirtFilterLayout } from './types';

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
      for (const filterValue of value.split(',')) migrated.append(plainKey, filterValue);
    }
  }

  return migrated;
};

export const isExcludedValue = (value: string): boolean => value.startsWith(EXCLUSION_URL_PREFIX);

export const stripExclusionPrefix = (value: string): string =>
  isExcludedValue(value) ? value.slice(EXCLUSION_URL_PREFIX.length) : value;

export const hasActiveProxyFilter = (
  query: URLSearchParams,
  filterOptions?: Record<string, unknown>,
): boolean => {
  if (!filterOptions) return false;

  for (const [key, value] of query.entries()) {
    if (Object.hasOwn(filterOptions, key) && !isExcludedValue(value)) return true;
  }

  return false;
};

export const matchesWithExclusion = <T extends FilterableObject>(
  filterDef: KubevirtFilter<T>,
  obj: T,
  selected: string[],
): boolean => {
  const included = selected.filter((value) => !isExcludedValue(value));
  const excluded = selected.filter(isExcludedValue).map(stripExclusionPrefix);

  const matchesIncluded = included.length === 0 || filterDef.match(obj, included);
  const matchesExcluded = excluded.length === 0 || !filterDef.match(obj, excluded);

  return matchesIncluded && matchesExcluded;
};

export const formatFilterValue = (value: string, excluded = false): string =>
  excluded ? `${EXCLUSION_URL_PREFIX}${value}` : value;

export const toGrouped = <T extends FilterableObject>(
  filter: KubevirtFilter<T>,
): KubevirtFilter<T> => ({
  ...filter,
  filterLayout: KubevirtFilterLayout.GROUPED,
});
