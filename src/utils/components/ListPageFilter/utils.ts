import * as fuzzy from 'fuzzysearch';

import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  K8sResourceCommon,
  MatchExpression,
  Operator,
  RowFilter,
  RowMatchFilter,
  RowReducerFilter,
  Selector,
} from '@openshift-console/dynamic-plugin-sdk';

import { TextFiltersType, useSearchFiltersParameters } from './hooks/useSearchFiltersParameters';
import { STATIC_SEARCH_FILTERS, STATIC_SEARCH_FILTERS_PLACEHOLDERS } from './constants';

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
    alreadySearchedCustomParam ||
    (hasNameFilter ? STATIC_SEARCH_FILTERS.name : Object.keys(filterDropdownItems)?.[0])
  );
};

export const generateRowFilters = (rowFilters: RowFilter[], data: K8sResourceCommon[]) =>
  rowFilters.map((rowFilter) => ({
    ...rowFilter,
    items: rowFilter.items.map((item) => ({
      ...item,
      count: (rowFilter as RowMatchFilter).isMatch
        ? data.filter((d) => (rowFilter as RowMatchFilter).isMatch(d, item.id)).length
        : data.reduce((acc, current) => {
            const currentKey = (rowFilter as RowReducerFilter).reducer(current);
            acc[currentKey] ? acc[currentKey]++ : (acc[currentKey] = 1);
            return acc;
          }, {})?.[item.id] ?? '0',
    })),
  }));

export const fuzzyCaseInsensitive = (a: string, b: string): boolean =>
  fuzzy(a.toLowerCase(), b.toLowerCase());

export const getFiltersData = (generatedRowFilters) =>
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
        [filterGroupName]: `rowFilter-${type}`,
      } as FilterKeys,
      // Default selections
      Array.from(new Set([...defaultSelectedAcc, ...(defaultSelected ?? [])])),
    ],
    [{}, {}, {}, []],
  );

export const intersection = (a: string[], b: string[]) => {
  const s = new Set(b);
  return a.filter((x) => s.has(x));
};

export const getLabelsAsString = (obj: K8sResourceCommon): string[] => {
  const requirements = toRequirements(obj.metadata.labels);
  return Object.values(requirements).map(requirementToString);
};

export const labelParser = (resources: K8sResourceCommon[]): Set<string> => {
  return resources.reduce((acc: Set<string>, resource: K8sResourceCommon) => {
    getLabelsAsString(resource).forEach((label) => acc.add(label));
    return acc;
  }, new Set<string>());
};

const toArray = (value) => (Array.isArray(value) ? value : [value]);

export const requirementToString = (requirement: MatchExpression): string => {
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

  return requirementStrings[requirement.operator] || '';
};

export const createEquals = (key: string, value: string): MatchExpression => ({
  key,
  operator: Operator.Equals,
  values: [value],
});

const isOldFormat = (selector: Selector) => !selector.matchLabels && !selector.matchExpressions;

export const toRequirements = (selector: Selector = {}) => {
  const matchLabels = isOldFormat(selector) ? selector : selector.matchLabels;
  const { matchExpressions } = selector;

  const requirements = Object.keys(matchLabels || {})
    .sort()
    .map((match) => createEquals(match, matchLabels[match]));

  requirements.push(...(matchExpressions || []));

  return requirements;
};

export const getInitialSearchText = (
  searchText: ReturnType<typeof useSearchFiltersParameters>,
  searchFilterType: string,
) => (searchFilterType !== STATIC_SEARCH_FILTERS.labels ? searchText[searchFilterType] : '');

export const getSearchTextPlaceholder = (
  searchType: string,
  selectedSearchFilter: RowFilter,
  nameFilterPlaceholder: string,
) => {
  if (searchType === STATIC_SEARCH_FILTERS.name)
    return nameFilterPlaceholder || STATIC_SEARCH_FILTERS_PLACEHOLDERS.name;

  return (
    STATIC_SEARCH_FILTERS_PLACEHOLDERS[searchType] ||
    t('Search by {{filterName}}...', {
      filterName: selectedSearchFilter?.filterGroupName,
    })
  );
};
