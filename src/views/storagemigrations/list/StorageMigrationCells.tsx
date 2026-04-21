import React, { FC } from 'react';
import { useNavigate } from 'react-router';

import LazyActionMenu from '@kubevirt-utils/components/LazyActionMenu/LazyActionMenu';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  modelToGroupVersionKind,
  modelToRef,
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
  NamespaceModel,
  StorageClassModel,
} from '@kubevirt-utils/models';
import { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import {
  getMigrationStartTimestamp,
  getVolumeCountFromMigPlan,
} from '@kubevirt-utils/resources/migrations/utils';
import { getName, getNamespace, getResourceUrl } from '@kubevirt-utils/resources/shared';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import { Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { Progress } from '@patternfly/react-core';

import { getMigrationPercentage, getStatusMigration } from './components/utils';
import { getStorageClassesFromMigPlan } from './utils';

type CellProps = {
  row: MultiNamespaceVirtualMachineStorageMigrationPlan;
};

export const NameCell: FC<CellProps> = ({ row }) => {
  const navigate = useNavigate();
  const clusterParam = useClusterParam();
  const cluster = getCluster(row) || clusterParam;
  const migPlanName = getName(row);

  return (
    <span data-test={`storage-migration-name-${migPlanName}`}>
      <MulticlusterResourceLink
        groupVersionKind={modelToGroupVersionKind(
          MultiNamespaceVirtualMachineStorageMigrationPlanModel,
        )}
        onClick={() =>
          navigate(
            getResourceUrl({
              model: MultiNamespaceVirtualMachineStorageMigrationPlanModel,
              resource: row,
            }),
          )
        }
        cluster={cluster}
        name={migPlanName}
        namespace={getNamespace(row)}
      />
    </span>
  );
};

export const NamespacesCell: FC<CellProps> = ({ row }) => {
  const clusterParam = useClusterParam();
  const isACMPage = useIsACMPage();
  const cluster = getCluster(row) || clusterParam;
  const namespaces = row?.spec?.namespaces;

  if (isEmpty(namespaces)) {
    return <span data-test={`storage-migration-namespaces-${getName(row)}`}>{NO_DATA_DASH}</span>;
  }

  return (
    <span data-test={`storage-migration-namespaces-${getName(row)}`}>
      {namespaces.map((namespace) => (
        <MulticlusterResourceLink
          cluster={isACMPage ? cluster : undefined}
          groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
          key={namespace.name}
          name={namespace.name}
        />
      ))}
    </span>
  );
};

export const StorageMigrationCell: FC<CellProps> = ({ row }) => {
  const { t } = useKubevirtTranslation();
  const volumeCount = getVolumeCountFromMigPlan(row) ?? 0;

  return (
    <span data-test={`storage-migration-volumes-${getName(row)}`}>
      {t('{{count}} Volumes', { count: volumeCount })}
    </span>
  );
};

export const TargetStorageClassCell: FC<CellProps> = ({ row }) => {
  const navigate = useNavigate();
  const clusterParam = useClusterParam();
  const cluster = getCluster(row) || clusterParam;
  const targetStorageClasses = getStorageClassesFromMigPlan(row);

  if (isEmpty(targetStorageClasses)) {
    return <span data-test={`storage-migration-target-sc-${getName(row)}`}>{NO_DATA_DASH}</span>;
  }

  return (
    <span data-test={`storage-migration-target-sc-${getName(row)}`}>
      {targetStorageClasses.map((storageClass) => (
        <MulticlusterResourceLink
          cluster={cluster}
          groupVersionKind={modelToGroupVersionKind(StorageClassModel)}
          key={storageClass}
          name={storageClass}
          onClick={() => navigate(`/k8s/cluster/storageclasses/${storageClass}`)}
        />
      ))}
    </span>
  );
};

export const StatusCell: FC<CellProps> = ({ row }) => {
  const statusMigration = getStatusMigration(row);
  const percentage = getMigrationPercentage(row);

  return (
    <span data-test={`storage-migration-status-${getName(row)}`}>
      <Progress
        aria-label={`${statusMigration.title}: ${percentage}%`}
        title={statusMigration.title}
        value={percentage}
        variant={statusMigration.variant}
      />
    </span>
  );
};

export const StartedCell: FC<CellProps> = ({ row }) => {
  const { t } = useKubevirtTranslation();
  const startTimestamp = getMigrationStartTimestamp(row);

  return (
    <span data-test={`storage-migration-started-${getName(row)}`}>
      {startTimestamp ? <Timestamp timestamp={startTimestamp} /> : t('Migration plan is pending')}
    </span>
  );
};

export const ActionsCell: FC<CellProps> = ({ row }) => (
  <LazyActionMenu
    context={{ [modelToRef(MultiNamespaceVirtualMachineStorageMigrationPlanModel)]: row }}
  />
);
