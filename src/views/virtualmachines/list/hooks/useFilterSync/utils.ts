import { type KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import {
  CLUSTER_LIST_FILTER_TYPE,
  PROJECT_LIST_FILTER_TYPE,
} from '@kubevirt-utils/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getACMVMListURL, getVMListURL } from '@multicluster/urls';

import {
  type GetFleetPathToolbarFiltersArgs,
  type ListClusterProjectQueryFilters,
  type NavigateToWidenedVmListPathParams,
  type PathScope,
  type SyncFleetToolbarFromQueryArgs,
  type WidenUrlPathForToolbarFiltersResult,
} from './types/types';

const getClusterProjectValuesFromSearchParams = (
  searchParams: URLSearchParams,
): { clusterFilterValues: string[]; projectFilterValues: string[] } => ({
  clusterFilterValues: searchParams.getAll(CLUSTER_LIST_FILTER_TYPE).filter(Boolean),
  projectFilterValues: searchParams.getAll(PROJECT_LIST_FILTER_TYPE).filter(Boolean),
});

export const hasMismatch = (targetValue: string | undefined, filterValues: string[]): boolean =>
  !!targetValue &&
  (isEmpty(filterValues) || filterValues.length > 1 || !filterValues.includes(targetValue));

export const widenUrlPathForToolbarFilters = (
  pathScope: PathScope,
  clusterFilterValues: string[],
  projectFilterValues: string[],
): WidenUrlPathForToolbarFiltersResult => {
  const { cluster: pathCluster, namespace } = pathScope;
  const cluster = pathCluster ?? undefined;

  if (hasMismatch(cluster, clusterFilterValues)) {
    return {
      scope: { cluster: undefined, namespace: undefined },
      shouldNavigate: true,
    };
  }

  if (hasMismatch(namespace, projectFilterValues)) {
    return {
      scope: { cluster, namespace: undefined },
      shouldNavigate: true,
    };
  }

  return {
    scope: { cluster, namespace },
    shouldNavigate: false,
  };
};

export const getClusterProjectQueryKey = (
  clusterFilterValues: string[],
  projectFilterValues: string[],
  namespace: string | undefined,
): string => {
  const projectFilters = namespace ? [namespace] : projectFilterValues;
  return `${clusterFilterValues.join('\0')}|${projectFilters.join('\0')}`;
};

export const getFleetPathToolbarFilters = ({
  namespace,
  searchParams,
}: GetFleetPathToolbarFiltersArgs): Partial<KubevirtFilterState> => {
  const { clusterFilterValues, projectFilterValues } =
    getClusterProjectValuesFromSearchParams(searchParams);

  const filtersFromQuery = [...new Set(searchParams.keys())].reduce<Partial<KubevirtFilterState>>(
    (acc, key) => {
      const values = searchParams.getAll(key)?.filter(Boolean) as string[];

      if (!isEmpty(values)) {
        acc[key] = values;
      }

      return acc;
    },
    {},
  );

  return {
    ...filtersFromQuery,
    [CLUSTER_LIST_FILTER_TYPE]: clusterFilterValues,
    [PROJECT_LIST_FILTER_TYPE]: namespace ? [namespace] : projectFilterValues,
  };
};

export const syncFleetToolbarFromQuery = ({
  namespace,
  onSetFilters,
  searchParams,
}: SyncFleetToolbarFromQueryArgs): void => {
  onSetFilters(getFleetPathToolbarFilters({ namespace, searchParams }));
};

export const navigateToWidenedVmListPath = ({
  isACMPage,
  navigate,
  scope,
  searchParams,
}: NavigateToWidenedVmListPathParams): void => {
  const pathname = isACMPage
    ? getACMVMListURL(scope.cluster, scope.namespace)
    : getVMListURL(undefined, scope.namespace);

  navigate({ pathname, search: searchParams.toString() }, { replace: true });
};

export const getListClusterProjectQueryFilterValues = (
  searchParams: URLSearchParams,
  namespace: string | undefined,
): ListClusterProjectQueryFilters => {
  const { clusterFilterValues, projectFilterValues } =
    getClusterProjectValuesFromSearchParams(searchParams);
  const clusterProjectQueryKey = getClusterProjectQueryKey(
    clusterFilterValues,
    projectFilterValues,
    namespace,
  );

  return { clusterFilterValues, clusterProjectQueryKey, projectFilterValues };
};
