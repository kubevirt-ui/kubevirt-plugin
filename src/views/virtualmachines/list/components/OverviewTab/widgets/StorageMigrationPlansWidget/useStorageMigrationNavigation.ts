import { useMemo } from 'react';

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
import { spokeSupportsCustomMigrationsRoute } from '@virtualmachines/actions/hooks/storageMigrationApi/constants';

import {
  STORAGE_MIGRATION_STATUS_FILTER_TYPE,
  StorageMigrationStatusFilterValue,
} from '../../../../../../storagemigrations/list/StorageMigrationListFilters';

const ALL_NAMESPACES_STORAGE_MIGRATIONS_LIST = '/k8s/all-namespaces/storagemigrations';
const STATUS_FILTER_PARAM = `${ROW_FILTERS_PREFIX}${STORAGE_MIGRATION_STATUS_FILTER_TYPE}`;

const withStatusFilter = (base: string, value: StorageMigrationStatusFilterValue): string =>
  `${base}?${STATUS_FILTER_PARAM}=${value}`;

/**
 * Resolves the console path for spoke clusters.
 * MTC uses its own GVK resource page (our custom list doesn't show MigPlans).
 * For other backends, use the custom route if the spoke supports it (>= 4.23),
 * otherwise fall back to the GVK resource URL.
 */
const getSpokeStorageMigrationListPath = (
  storageMigAPI: StorageMigrationAPI,
  spokeCsvVersion: string | undefined,
): string => {
  const usesCustomRoute =
    storageMigAPI !== STORAGE_MIGRATION_API.MTC &&
    spokeSupportsCustomMigrationsRoute(spokeCsvVersion);

  if (usesCustomRoute) {
    return ALL_NAMESPACES_STORAGE_MIGRATIONS_LIST;
  }

  const backend = getStorageMigrationBackend(storageMigAPI);
  return getResourceUrl({ model: backend?.planModel }) ?? ALL_NAMESPACES_STORAGE_MIGRATIONS_LIST;
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
  spokeCsvVersion?: string,
): StorageMigrationNavigation => {
  const [hubClusterName, hubClusterLoaded] = useHubClusterName();
  const { spokeConsoleURL } = useManagedClusterConsoleURLs(cluster);

  const isUnavailable =
    storageMigAPI === STORAGE_MIGRATION_API.LOADING || storageMigAPI === STORAGE_MIGRATION_API.NONE;

  return useMemo(() => {
    if (isUnavailable) {
      return {
        basePath: '',
        isExternal: false,
        pendingUrl: '',
        runningUrl: '',
      };
    }

    const isManagedSpokeCluster =
      Boolean(cluster) && hubClusterLoaded && cluster !== hubClusterName;
    const useSpokeConsoleUrl = Boolean(spokeConsoleURL) && isManagedSpokeCluster;

    const consolePath = useSpokeConsoleUrl
      ? getSpokeStorageMigrationListPath(storageMigAPI, spokeCsvVersion)
      : ALL_NAMESPACES_STORAGE_MIGRATIONS_LIST;

    const base = useSpokeConsoleUrl
      ? buildSpokeConsoleUrl(spokeConsoleURL, consolePath)
      : consolePath;

    const pendingUrl = withStatusFilter(base, StorageMigrationStatusFilterValue.Pending);
    const runningUrl = withStatusFilter(base, StorageMigrationStatusFilterValue.Running);

    return {
      basePath: base,
      isExternal: useSpokeConsoleUrl,
      pendingUrl,
      runningUrl,
    };
  }, [
    cluster,
    hubClusterLoaded,
    hubClusterName,
    isUnavailable,
    spokeCsvVersion,
    spokeConsoleURL,
    storageMigAPI,
  ]);
};

export default useStorageMigrationNavigation;
