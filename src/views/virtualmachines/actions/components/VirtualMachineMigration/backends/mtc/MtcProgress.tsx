import React, { FC } from 'react';

import { useKubevirtClusterServiceVersion } from '@kubevirt-utils/hooks/useKubevirtClusterServiceVersion';
import type { ProgressComponentProps } from '@kubevirt-utils/resources/migrations/backends/types';
import useStorageMigrationNavigation from '@virtualmachines/list/components/OverviewTab/widgets/StorageMigrationPlansWidget/useStorageMigrationNavigation';

import StorageMigrationProgress from '../../components/StorageMigrationProgress';

import useMTCPlanPolling from './useMTCPlanPolling';

const MtcProgress: FC<ProgressComponentProps> = (props) => {
  const { cluster, storageMigAPI, storageMigrationPlan } = props;
  const { installedCSV } = useKubevirtClusterServiceVersion(cluster);
  const { basePath, isExternal } = useStorageMigrationNavigation(
    cluster,
    storageMigAPI,
    installedCSV?.spec?.version,
  );
  const [mtcWatchedPlan, , mtcError] = useMTCPlanPolling(storageMigrationPlan);

  return (
    <StorageMigrationProgress
      {...props}
      basePath={basePath}
      fetchingError={mtcError}
      isExternal={isExternal}
      watchStorageMigrationPlan={mtcWatchedPlan ?? storageMigrationPlan}
    />
  );
};

export default MtcProgress;
