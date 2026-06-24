import React, { FC } from 'react';

import { useKubevirtClusterServiceVersion } from '@kubevirt-utils/hooks/useKubevirtClusterServiceVersion';
import type { ProgressComponentProps } from '@kubevirt-utils/resources/migrations/backends/types';

import useStorageMigrationNavigation from '../../../../hooks/useStorageMigrationNavigation';
import StorageMigrationProgress from '../../components/StorageMigrationProgress';

import useSingleNsPlanPolling from './useSingleNsPlanPolling';

const SingleNsProgress: FC<ProgressComponentProps> = (props) => {
  const { cluster, storageMigAPI, storageMigrationPlan } = props;
  const { installedCSV } = useKubevirtClusterServiceVersion(cluster);
  const { basePath, isExternal } = useStorageMigrationNavigation(
    cluster,
    storageMigAPI,
    installedCSV?.spec?.version,
  );
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
