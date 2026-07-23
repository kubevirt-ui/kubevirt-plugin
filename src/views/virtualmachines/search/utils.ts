import { isEmpty } from '@kubevirt-utils/utils/utils';
import { resolveDateCreatedValue } from '@search/utils/dateCreatedValues';
import { AdvancedSearchFilter } from '@stolostron/multicluster-sdk';

type DateCreatedSearchParams = {
  createdFrom: string | null;
  createdTo: string | null;
  dateCreated: string | null;
};

const appendCreatedQuery = (
  vmQueries: AdvancedSearchFilter,
  operator: '>=' | '<=',
  value: string,
): void => {
  vmQueries.push({ property: 'created', values: [`${operator}${value}`] });
};

const appendResolvedDateCreated = (vmQueries: AdvancedSearchFilter, dateCreated: string): void => {
  const resolved = resolveDateCreatedValue(dateCreated);
  if (!resolved) return;

  appendCreatedQuery(vmQueries, '>=', resolved.from);
  if (resolved.to) {
    appendCreatedQuery(vmQueries, '<=', resolved.to);
  }
};

const appendCustomDateRange = (
  vmQueries: AdvancedSearchFilter,
  createdFrom: string | null,
  createdTo: string | null,
): void => {
  if (createdFrom) {
    appendCreatedQuery(vmQueries, '>=', createdFrom);
  }
  if (createdTo) {
    appendCreatedQuery(vmQueries, '<=', createdTo);
  }
};

export const appendDateCreatedSearchQueries = (
  vmQueries: AdvancedSearchFilter,
  { dateCreated, createdFrom, createdTo }: DateCreatedSearchParams,
): void => {
  if (dateCreated) {
    appendResolvedDateCreated(vmQueries, dateCreated);
    return;
  }

  appendCustomDateRange(vmQueries, createdFrom, createdTo);
};

export const getSearchQueries = (
  searchQueries: AdvancedSearchFilter,
  clusters: string[],
): AdvancedSearchFilter | null => {
  const searchQueriesExist = !isEmpty(searchQueries);
  const clustersExist = !isEmpty(clusters);
  const clusterPropertyExists = searchQueries?.find(
    (query) =>
      query.property === 'cluster' &&
      Array.isArray(query.values) &&
      query.values.length === clusters?.length &&
      query.values.every((clusterValue) => clusters.includes(clusterValue)),
  );

  if (!searchQueriesExist && !clustersExist) return null;

  if (!searchQueriesExist && clustersExist) return [{ property: 'cluster', values: clusters }];

  if (searchQueriesExist && clustersExist)
    return clusterPropertyExists
      ? searchQueries
      : [...searchQueries, { property: 'cluster', values: clusters }];

  return searchQueries;
};
