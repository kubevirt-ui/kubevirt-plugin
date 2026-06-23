import React, { FC } from 'react';

import type { ProgressComponentProps } from '@kubevirt-utils/resources/migrations/backends/types';
import useStorageMigrationNavigation from '@virtualmachines/list/components/OverviewTab/widgets/StorageMigrationPlansWidget/useStorageMigrationNavigation';

import StorageMigrationProgress from '../../components/StorageMigrationProgress';

import useMTCPlanPolling from './useMTCPlanPolling';

const MtcProgress: FC<ProgressComponentProps> = (props) => {
  const { cluster, storageMigAPI, storageMigrationPlan } = props;
  const { basePath, isExternal } = useStorageMigrationNavigation(cluster, storageMigAPI);
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
