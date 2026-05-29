import { useMemo } from 'react';

import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import { getStorageMigrationBackend } from '@kubevirt-utils/resources/migrations/backends';
import {
  type StorageMigrationAPI,
  STORAGE_MIGRATION_API,
} from '@kubevirt-utils/resources/migrations/constants';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { ROW_FILTERS_PREFIX } from '@kubevirt-utils/utils/constants';
import useManagedClusterConsoleURLs from '@multicluster/hooks/useManagedClusterConsoleURLs';
import { buildSpokeConsoleUrl } from '@multicluster/urls';
import { useHubClusterName } from '@stolostron/multicluster-sdk';

import {
  STORAGE_MIGRATION_STATUS_FILTER_TYPE,
  StorageMigrationStatusFilterValue,
} from '../../../../../../storagemigrations/list/StorageMigrationListFilters';

const ALL_NAMESPACES_STORAGE_MIGRATIONS_LIST = '/k8s/all-namespaces/storagemigrations';
const STATUS_FILTER_PARAM = `${ROW_FILTERS_PREFIX}${STORAGE_MIGRATION_STATUS_FILTER_TYPE}`;

const withStatusFilter = (base: string, value: StorageMigrationStatusFilterValue): string =>
  `${base}?${STATUS_FILTER_PARAM}=${value}`;

export const getStorageMigrationListConsolePath = (
  activeNamespace: string | undefined,
  storageMigAPI: StorageMigrationAPI,
): string => {
  const backend = getStorageMigrationBackend(storageMigAPI);
  if (backend?.listConsolePathUsesResourceUrl) {
    return (
      getResourceUrl({
        activeNamespace,
        model: backend.planModel,
      }) ?? ''
    );
  }
  return ALL_NAMESPACES_STORAGE_MIGRATIONS_LIST;
};

type StorageMigrationNavigation = {
  basePath: string;
  isExternal: boolean;
  pendingUrl: string;
  runningUrl: string;
};

const useStorageMigrationNavigation = (
  cluster?: string,
  storageMigAPI: StorageMigrationAPI = STORAGE_MIGRATION_API.MULTI_NS,
): StorageMigrationNavigation => {
  const activeNamespace = useActiveNamespace();
  const [hubClusterName, hubClusterLoaded] = useHubClusterName();
  const { spokeConsoleURL } = useManagedClusterConsoleURLs(cluster);

  const isLoading =
    storageMigAPI === STORAGE_MIGRATION_API.LOADING || storageMigAPI === STORAGE_MIGRATION_API.NONE;

  return useMemo(() => {
    if (isLoading) {
      return {
        basePath: '',
        isExternal: false,
        pendingUrl: '',
        runningUrl: '',
      };
    }

    const listPath = getStorageMigrationListConsolePath(activeNamespace, storageMigAPI);

    const isManagedSpokeCluster =
      Boolean(cluster) && hubClusterLoaded && cluster !== hubClusterName;
    const useSpokeConsoleUrl = Boolean(spokeConsoleURL) && isManagedSpokeCluster;

    const base = useSpokeConsoleUrl ? buildSpokeConsoleUrl(spokeConsoleURL, listPath) : listPath;

    const pendingUrl = withStatusFilter(base, StorageMigrationStatusFilterValue.Pending);
    const runningUrl = withStatusFilter(base, StorageMigrationStatusFilterValue.Running);

    return {
      basePath: base,
      isExternal: useSpokeConsoleUrl,
      pendingUrl,
      runningUrl,
    };
  }, [
    activeNamespace,
    cluster,
    hubClusterLoaded,
    hubClusterName,
    isLoading,
    spokeConsoleURL,
    storageMigAPI,
  ]);
};

export default useStorageMigrationNavigation;
