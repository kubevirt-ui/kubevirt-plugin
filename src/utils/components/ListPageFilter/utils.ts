import * as fuzzy from 'fuzzysearch';

import {
  type K8sResourceCommon,
  type MatchExpression,
  Operator,
  type RowFilter,
  type RowMatchFilter,
  type RowReducerFilter,
  type Selector,
} from '@openshift-console/dynamic-plugin-sdk';
import { getRowFilterQueryKey } from '@search/utils/query';

import { STATIC_SEARCH_FILTERS } from './constants';
import { type ExtendedRowFilter, type TextFiltersType } from './types';

export * from './searchTextUtils';

export type Filter = {
  [key: string]: string[];
};

export type FilterKeys = {
  [key: string]: string;
};

export const getInitialSearchType = (
  customSearchFilter: RowFilter[],
  textFilters: TextFiltersType,
  filterDropdownItems: Record<string, string>,
): string => {
  const alreadySearchedCustomParam = customSearchFilter?.find(
    (searchFilter) => textFilters[searchFilter.type],
  )?.type;

  const hasNameFilter = 'name' in filterDropdownItems;

  return (
    alreadySearchedCustomParam ??
    (hasNameFilter ? STATIC_SEARCH_FILTERS.name : Object.keys(filterDropdownItems)?.[0])
  );
};

export const generateRowFilters = (
  rowFilters: ExtendedRowFilter[],
  data: K8sResourceCommon[],
): ExtendedRowFilter[] =>
  rowFilters.map((rowFilter) => ({
    ...rowFilter,
    items: rowFilter.items.map((item) => ({
      ...item,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      count: (rowFilter as RowMatchFilter).isMatch
        ? data.filter((_dataItem) => (rowFilter as RowMatchFilter).isMatch(_dataItem, item.id))
            .length
        : (data.reduce((acc, current) => {
            (rowFilter as RowReducerFilter).reducer(current);
            return acc;
          }, {})?.[item.id] ?? '0'),
    })),
  }));

export const fuzzyCaseInsensitive = (a: string, b: string): boolean =>
  fuzzy(a.toLowerCase(), b.toLowerCase());

export const getFiltersData = (
  generatedRowFilters: ExtendedRowFilter[],
): [Filter, FilterKeys, FilterKeys, string[]] =>
  generatedRowFilters.reduce(
    (
      [filtersAcc, filtersNameMapAcc, filterKeysAcc, defaultSelectedAcc],
      { defaultSelected, filterGroupName, items, type },
    ) => [
      // (rowFilters) => {'rowFilterTypeA': ['staA', 'staB'], 'rowFilterTypeB': ['stbA'] }
      {
        ...filtersAcc,

        [filterGroupName]: (items ?? []).map(({ id }) => id),
      } as Filter,
      // {id: 'a' , title: 'A'} => filterNameMap['a'] = A
      {
        ...filtersNameMapAcc,
        ...(items ?? []).reduce(
          (itemAcc, { id, title }) => ({
            ...itemAcc,

            [id]: title,
          }),
          {},
        ),
      } as FilterKeys,
      {
        ...filterKeysAcc,
        [filterGroupName]: getRowFilterQueryKey(type),
      } as FilterKeys,
      // Default selections

      Array.from(new Set([...defaultSelectedAcc, ...(defaultSelected ?? [])])),
    ],
    [{}, {}, {}, []],
  );

export const intersection = (a: string[], bArr: string[]): string[] => {
  const filterSet = new Set(bArr);
  return a.filter((item) => filterSet.has(item));
};

export const getLabelsAsString = (obj: K8sResourceCommon): string[] => {
  const requirements = toRequirements(obj?.metadata?.labels);
  return Object.values(requirements).map(requirementToString);
};

export const labelParser = (resources?: K8sResourceCommon[]): Set<string> => {
  return (resources ?? []).reduce((acc: Set<string>, resource: K8sResourceCommon) => {
    for (const label of getLabelsAsString(resource)) acc.add(label);
    return acc;
  }, new Set<string>());
};

const toArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [value]);

const requirementToString = (requirement: MatchExpression): string => {
  const requirementStrings = {
    [Operator.DoesNotExist]: `!${requirement.key}`,
    [Operator.Equals]: `${requirement.key}=${requirement.values[0]}`,
    [Operator.Exists]: requirement.key,
    [Operator.GreaterThan]: `${requirement.key} > ${requirement.values[0]}`,
    [Operator.In]: `${requirement.key} in (${toArray(requirement.values).join(',')})`,
    [Operator.LessThan]: `${requirement.key} < ${requirement.values[0]}`,
    [Operator.NotEquals]: `${requirement.key}!=${requirement.values[0]}`,
    [Operator.NotIn]: `${requirement.key} notin (${toArray(requirement.values).join(',')})`,
  };

  return requirementStrings[requirement.operator] ?? '';
};

const createEquals = (key: string, value: string): MatchExpression => ({
  key,
  operator: Operator.Equals,
  values: [value],
});

const isOldFormat = (selector: Selector): boolean =>
  !selector.matchLabels && !selector.matchExpressions;

const toRequirements = (selector: Selector = {}): MatchExpression[] => {
  const matchLabels = isOldFormat(selector) ? selector : selector.matchLabels;
  const { matchExpressions } = selector;

  const requirements = Object.keys(matchLabels ?? {})
    .sort((first, second) => first.localeCompare(second))
    .map((match) => createEquals(match, matchLabels[match]));

  requirements.push(...(matchExpressions ?? []));

  return requirements;
};
