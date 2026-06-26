import { useMemo } from 'react';

import { getStorageMigrationBackend } from '@kubevirt-utils/resources/migrations/backends';
import {
  type StorageMigrationAPI,
  STORAGE_MIGRATION_API,
} from '@kubevirt-utils/resources/migrations/constants';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import useManagedClusterConsoleURLs from '@multicluster/hooks/useManagedClusterConsoleURLs';
import { useHubClusterName } from '@stolostron/multicluster-sdk';
import { spokeSupportsCustomMigrationsRoute } from '@virtualmachines/actions/hooks/storageMigrationApi/constants';

const ALL_NAMESPACES_STORAGE_MIGRATIONS_LIST = '/k8s/all-namespaces/storagemigrations';

const buildSpokeConsoleUrl = (spokeConsoleURL: string, path: string): string => {
  const base = spokeConsoleURL.endsWith('/') ? spokeConsoleURL.slice(0, -1) : spokeConsoleURL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
};

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
};

const useStorageMigrationNavigation = (
  cluster?: string,
  storageMigAPI: StorageMigrationAPI = STORAGE_MIGRATION_API.MULTI_NS,
  spokeCsvVersion?: string,
): StorageMigrationNavigation => {
  const [hubClusterName, hubClusterLoaded] = useHubClusterName();
  const { getConsoleURL } = useManagedClusterConsoleURLs();

  const isUnavailable =
    storageMigAPI === STORAGE_MIGRATION_API.LOADING || storageMigAPI === STORAGE_MIGRATION_API.NONE;

  return useMemo(() => {
    if (isUnavailable) {
      return {
        basePath: '',
        isExternal: false,
      };
    }

    const isManagedSpokeCluster =
      Boolean(cluster) && hubClusterLoaded && cluster !== hubClusterName;
    const spokeConsoleURL = cluster ? getConsoleURL(cluster) : undefined;
    const useSpokeConsoleUrl = Boolean(spokeConsoleURL) && isManagedSpokeCluster;

    const consolePath = useSpokeConsoleUrl
      ? getSpokeStorageMigrationListPath(storageMigAPI, spokeCsvVersion)
      : ALL_NAMESPACES_STORAGE_MIGRATIONS_LIST;

    const basePath = useSpokeConsoleUrl
      ? buildSpokeConsoleUrl(spokeConsoleURL, consolePath)
      : consolePath;

    return {
      basePath,
      isExternal: useSpokeConsoleUrl,
    };
  }, [
    cluster,
    getConsoleURL,
    hubClusterLoaded,
    hubClusterName,
    isUnavailable,
    spokeCsvVersion,
    storageMigAPI,
  ]);
};

export default useStorageMigrationNavigation;
