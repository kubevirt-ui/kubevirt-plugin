import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

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
import MulticlusterResourceLink from '@multicluster/components/MulticlusterResourceLink/MulticlusterResourceLink';
import { getCluster } from '@multicluster/helpers/selectors';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { RowProps, TableData, Timestamp } from '@openshift-console/dynamic-plugin-sdk';
import { Progress } from '@patternfly/react-core';

import { getStorageClassesFromMigPlan } from '../utils';

import { getMigrationPercentage, getStatusMigration } from './utils';

type StorageMigrationRowProps = RowProps<MultiNamespaceVirtualMachineStorageMigrationPlan>;

const StorageMigrationRow: FC<StorageMigrationRowProps> = ({ activeColumnIDs, obj }) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();
  const clusterParam = useClusterParam();
  const cluster = getCluster(obj) || clusterParam;

  const targetStorageClasses = getStorageClassesFromMigPlan(obj);

  const migPlanName = getName(obj);

  const statusMigration = getStatusMigration(obj);

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-30" id="name">
        <MulticlusterResourceLink
          groupVersionKind={modelToGroupVersionKind(
            MultiNamespaceVirtualMachineStorageMigrationPlanModel,
          )}
          onClick={() =>
            navigate(
              getResourceUrl({
                model: MultiNamespaceVirtualMachineStorageMigrationPlanModel,
                resource: obj,
              }),
            )
          }
          cluster={cluster}
          name={migPlanName}
          namespace={getNamespace(obj)}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="namespaces">
        {obj?.spec?.namespaces?.map((namespace) => (
          <MulticlusterResourceLink
            cluster={cluster}
            groupVersionKind={modelToGroupVersionKind(NamespaceModel)}
            key={namespace.name}
            name={namespace.name}
          />
        ))}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="storagemigration">
        {t('{{count}} Volumes', { count: getVolumeCountFromMigPlan(obj) ?? 0 })}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="targetsc">
        {targetStorageClasses?.map((storageClass) => (
          <MulticlusterResourceLink
            cluster={cluster}
            groupVersionKind={modelToGroupVersionKind(StorageClassModel)}
            key={storageClass}
            name={storageClass}
            onClick={() => navigate(`/k8s/cluster/storageclasses/${storageClass}`)}
          />
        ))}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-20" id="status">
        <Progress
          title={statusMigration.title}
          value={getMigrationPercentage(obj)}
          variant={statusMigration.variant}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="started">
        {getMigrationStartTimestamp(obj) ? (
          <Timestamp timestamp={getMigrationStartTimestamp(obj)} />
        ) : (
          t('Migration plan is pending')
        )}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action" id="">
        <LazyActionMenu
          context={{ [modelToRef(MultiNamespaceVirtualMachineStorageMigrationPlanModel)]: obj }}
        />
      </TableData>
    </>
  );
};

export default StorageMigrationRow;
