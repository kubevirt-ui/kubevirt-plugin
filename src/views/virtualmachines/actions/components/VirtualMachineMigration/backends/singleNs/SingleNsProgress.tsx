import React, { FC } from 'react';

import type { ProgressComponentProps } from '@kubevirt-utils/resources/migrations/backends/types';
import useStorageMigrationNavigation from '@virtualmachines/list/components/OverviewTab/widgets/StorageMigrationPlansWidget/useStorageMigrationNavigation';

import StorageMigrationProgress from '../../components/StorageMigrationProgress';

import useSingleNsPlanPolling from './useSingleNsPlanPolling';

const SingleNsProgress: FC<ProgressComponentProps> = (props) => {
  const { cluster, storageMigAPI, storageMigrationPlan } = props;
  const { basePath, isExternal } = useStorageMigrationNavigation(cluster, storageMigAPI);
  const [singleNsWatchedPlan, , singleNsError] = useSingleNsPlanPolling(storageMigrationPlan);

  return (
    <StorageMigrationProgress
      {...props}
      basePath={basePath}
      fetchingError={singleNsError}
      isExternal={isExternal}
      watchStorageMigrationPlan={singleNsWatchedPlan ?? storageMigrationPlan}
    />
  );
};

export default SingleNsProgress;
