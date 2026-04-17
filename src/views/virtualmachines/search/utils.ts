import { TFunction } from 'react-i18next';

import { isEmpty } from '@kubevirt-utils/utils/utils';
import { AdvancedSearchFilter } from '@stolostron/multicluster-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils/constants';

export const getTooltipContent = (filterType: VirtualMachineRowFilterType, t: TFunction) => {
  if (filterType === VirtualMachineRowFilterType.Cluster) {
    return t(
      'Cluster is already selected. To update filters, choose another project or cluster in the tree view.',
    );
  }
  if (filterType === VirtualMachineRowFilterType.Project) {
    return t(
      'Project is already selected. To update filters, choose another project or cluster in the tree view.',
    );
  }
  return null;
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
      query.values.every((v) => clusters.includes(v)),
  );

  if (!searchQueriesExist && !clustersExist) return null;

  if (!searchQueriesExist && clustersExist) return [{ property: 'cluster', values: clusters }];

  if (searchQueriesExist && clustersExist)
    return clusterPropertyExists
      ? searchQueries
      : [...searchQueries, { property: 'cluster', values: clusters }];

  return searchQueries;
};
