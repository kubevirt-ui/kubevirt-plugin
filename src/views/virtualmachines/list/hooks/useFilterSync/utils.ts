import type {
  KubevirtFilterState,
  OnSetFilters,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import {
  CLUSTER_LIST_FILTER_TYPE,
  PROJECT_LIST_FILTER_TYPE,
} from '@kubevirt-utils/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getACMVMListURL, getVMListURL } from '@multicluster/urls';

import {
  type NavigateToWidenedVmListPathParams,
  type PathScope,
  type WidenUrlPathForToolbarFiltersResult,
} from './types/types';

export const hasMismatch = (targetValue: string | undefined, filterValues: string[]): boolean =>
  !!targetValue &&
  (isEmpty(filterValues) || filterValues.length > 1 || !filterValues.includes(targetValue));

export const widenUrlPathForToolbarFilters = (
  pathScope: PathScope,
  clusterFilterValues: string[],
  projectFilterValues: string[],
): WidenUrlPathForToolbarFiltersResult => {
  const cluster = pathScope.cluster ?? undefined;

  if (hasMismatch(cluster, clusterFilterValues)) {
    return {
      scope: { cluster: undefined, namespace: undefined },
      shouldNavigate: true,
    };
  }

  if (hasMismatch(pathScope.namespace, projectFilterValues)) {
    return {
      scope: { cluster, namespace: undefined },
      shouldNavigate: true,
    };
  }

  return {
    scope: { cluster, namespace: pathScope.namespace },
    shouldNavigate: false,
  };
};

const getFleetListUrlFilterKey = (
  clusterFilterValues: string[],
  projectFilterValues: string[],
  namespace: string | undefined,
): string => {
  const projectFilters = namespace ? [namespace] : projectFilterValues;
  return `${clusterFilterValues.join('\0')}|${projectFilters.join('\0')}`;
};

type SyncFleetToolbarFromQueryArgs = {
  clusterFilterValues: string[];
  lastSyncedUrlFilterKey: string;
  namespace: string | undefined;
  onSetFilters: OnSetFilters;
  projectFilterValues: string[];
};

type FleetPathToolbarFilters = Pick<
  KubevirtFilterState,
  typeof CLUSTER_LIST_FILTER_TYPE | typeof PROJECT_LIST_FILTER_TYPE
>;

export const getFleetPathToolbarFilters = (
  clusterFilterValues: string[],
  projectFilterValues: string[],
  namespace: string | undefined,
): FleetPathToolbarFilters => ({
  [CLUSTER_LIST_FILTER_TYPE]: clusterFilterValues,
  [PROJECT_LIST_FILTER_TYPE]: namespace ? [namespace] : projectFilterValues,
});

export const syncFleetToolbarFromQueryIfChanged = ({
  clusterFilterValues,
  lastSyncedUrlFilterKey,
  namespace,
  onSetFilters,
  projectFilterValues,
}: SyncFleetToolbarFromQueryArgs): string => {
  const fleetUrlFilterKey = getFleetListUrlFilterKey(
    clusterFilterValues,
    projectFilterValues,
    namespace,
  );

  if (fleetUrlFilterKey === lastSyncedUrlFilterKey) {
    return lastSyncedUrlFilterKey;
  }

  const fleetPathToolbarFilters = getFleetPathToolbarFilters(
    clusterFilterValues,
    projectFilterValues,
    namespace,
  );

  onSetFilters(fleetPathToolbarFilters);
  return fleetUrlFilterKey;
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
