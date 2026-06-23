import React, { FC } from 'react';

import { useKubevirtClusterServiceVersion } from '@kubevirt-utils/hooks/useKubevirtClusterServiceVersion';
import {
  modelToGroupVersionKind,
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import type { ProgressComponentProps } from '@kubevirt-utils/resources/migrations/backends/types';
import { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import useStorageMigrationNavigation from '@virtualmachines/list/components/OverviewTab/widgets/StorageMigrationPlansWidget/useStorageMigrationNavigation';

import StorageMigrationProgress from '../../components/StorageMigrationProgress';

const MultiNsProgress: FC<ProgressComponentProps> = (props) => {
  const { cluster, storageMigAPI, storageMigrationPlan } = props;
  const { installedCSV } = useKubevirtClusterServiceVersion(cluster);
  const { basePath, isExternal } = useStorageMigrationNavigation(
    cluster,
    storageMigAPI,
    installedCSV?.spec?.version,
  );

  const [multiNsWatchedPlan, , multiNsError] =
    useK8sWatchData<MultiNamespaceVirtualMachineStorageMigrationPlan>(
      storageMigrationPlan
        ? {
            cluster: getCluster(storageMigrationPlan),
            groupVersionKind: modelToGroupVersionKind(
              MultiNamespaceVirtualMachineStorageMigrationPlanModel,
            ),
            name: getName(storageMigrationPlan),
            namespace: getNamespace(storageMigrationPlan),
          }
        : null,
    );

  return (
    <StorageMigrationProgress
      {...props}
      basePath={basePath}
      fetchingError={multiNsError}
      isExternal={isExternal}
      watchStorageMigrationPlan={multiNsWatchedPlan ?? storageMigrationPlan}
    />
  );
};

export default MultiNsProgress;
