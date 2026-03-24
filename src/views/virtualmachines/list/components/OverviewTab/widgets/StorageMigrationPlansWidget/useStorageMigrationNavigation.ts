import { useMemo } from 'react';

import { MultiNamespaceVirtualMachineStorageMigrationPlanModel } from '@kubevirt-utils/models';
import { getResourceUrl } from '@kubevirt-utils/resources/shared';
import { ROW_FILTERS_PREFIX } from '@kubevirt-utils/utils/constants';
import useManagedClusterConsoleURLs from '@multicluster/hooks/useManagedClusterConsoleURLs';
import { buildSpokeConsoleUrl } from '@multicluster/urls';

import {
  STORAGE_MIGRATION_STATUS_FILTER_TYPE,
  StorageMigrationStatusFilterValue,
} from '../../../../../../storagemigrations/list/StorageMigrationListFilters';

const STORAGE_MIGRATION_LIST_PATH = getResourceUrl({
  model: MultiNamespaceVirtualMachineStorageMigrationPlanModel,
});

const STATUS_FILTER_PARAM = `${ROW_FILTERS_PREFIX}${STORAGE_MIGRATION_STATUS_FILTER_TYPE}`;

type StorageMigrationNavigation = {
  basePath: string;
  isExternal: boolean;
  pendingUrl: string;
  runningUrl: string;
};

const useStorageMigrationNavigation = (cluster?: string): StorageMigrationNavigation => {
  const { isSpokeCluster, spokeConsoleURL } = useManagedClusterConsoleURLs(cluster);

  return useMemo(() => {
    const base = isSpokeCluster
      ? buildSpokeConsoleUrl(spokeConsoleURL, STORAGE_MIGRATION_LIST_PATH)
      : STORAGE_MIGRATION_LIST_PATH;

    return {
      basePath: base,
      isExternal: isSpokeCluster,
      pendingUrl: `${base}?${STATUS_FILTER_PARAM}=${StorageMigrationStatusFilterValue.Pending}`,
      runningUrl: `${base}?${STATUS_FILTER_PARAM}=${StorageMigrationStatusFilterValue.Running}`,
    };
  }, [isSpokeCluster, spokeConsoleURL]);
};

export default useStorageMigrationNavigation;
