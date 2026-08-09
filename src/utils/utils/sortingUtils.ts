import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { SortByDirection } from '@patternfly/react-table';

export const getValueByPath = <T = K8sResourceCommon>(obj: T, path: string): unknown => {
  const pathArray = path?.split('.');
  return pathArray?.reduce<unknown>((acc, field) => (acc as Record<string, unknown>)?.[field], obj);
};

export const comparePathsValues =
  <T>(path: string) =>
  (first: T, second: T): number =>
    universalComparator(getValueByPath(first, path), getValueByPath(second, path));

export const columnSorting = <T>(
  data: T[],
  direction: string,
  pagination: Record<string, number>,
  path: string,
): T[] => columnSortingCompare(data, direction, pagination, comparePathsValues(path));

export const columnSortingCompare = <T>(
  data: T[],
  direction: string,
  pagination: Record<string, number>,
  compareFunction: (a: T, b: T) => number,
): T[] => {
  const { endIndex = data.length, startIndex = 0 } = pagination || {};
  const predicate = (a: T, b: T): number => {
    const { first, second } =
      direction === 'asc' ? { first: a, second: b } : { first: b, second: a };
    return compareFunction(first, second);
  };
  return data ? [...data].sort(predicate).slice(startIndex, endIndex) : undefined;
};

/**
 * Compares all types by converting them to string.
 * Nullish entities are converted to empty string.
 */
export const universalComparator = (a: unknown, b: unknown, locale?: string): number =>
  localeCompare(String(a ?? ''), String(b ?? ''), locale);

/**
 * Uses native string localCompare method with numeric option enabled.
 */
export const localeCompare = (a: string, b: string, locale: string): number =>
  a.localeCompare(b, locale, { numeric: true });

export const sortByDirection = (
  comparator: (a: unknown, b: unknown, locale?: string) => number,
  direction: SortByDirection,
) => {
  const multiplier = direction === SortByDirection.desc ? -1 : 1;
  return (a: unknown, b: unknown, locale?: string): number => multiplier * comparator(a, b, locale);
};

export const compareWithDirection = (direction: SortByDirection, a: unknown, b: unknown): number =>
  sortByDirection(universalComparator, direction)(a, b);
