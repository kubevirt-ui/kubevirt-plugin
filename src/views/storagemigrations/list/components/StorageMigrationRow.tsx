import React, { FC } from 'react';
import { useNavigate } from 'react-router-dom-v5-compat';

import ActionsDropdown from '@kubevirt-utils/components/ActionsDropdown/ActionsDropdown';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { modelToGroupVersionKind, StorageClassModel } from '@kubevirt-utils/models';
import { MigPlan, MigPlanModel } from '@kubevirt-utils/resources/migrations/constants';
import { getName, getNamespace, getResourceUrl } from '@kubevirt-utils/resources/shared';
import {
  ResourceLink,
  RowProps,
  TableData,
  Timestamp,
} from '@openshift-console/dynamic-plugin-sdk';
import { Progress } from '@patternfly/react-core';

import useStorageMigrationActions from '../../actions/useStorageMigrationActions';
import { MigPlanMap } from '../constants';
import { getSelectedPVFromMigPlan, getStorageClassesFromMigPlan } from '../utils';

import { getMigrationPercentage, getStatusMigration } from './utils';

type StorageMigrationRowProps = RowProps<MigPlan, { migPlanMap: MigPlanMap }>;

const StorageMigrationRow: FC<StorageMigrationRowProps> = ({
  activeColumnIDs,
  obj,
  rowData: { migPlanMap },
}) => {
  const { t } = useKubevirtTranslation();
  const navigate = useNavigate();

  const targetStorageClasses = getStorageClassesFromMigPlan(obj);

  const migPlanName = getName(obj);
  const migMigration = migPlanMap[migPlanName]?.migMigration;
  const directVolumeMigration = migPlanMap[migPlanName]?.directVolumeMigration;

  const statusMigration = getStatusMigration(migMigration, directVolumeMigration);

  const [storageMigrationActions] = useStorageMigrationActions(obj);

  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-m-width-30" id="name">
        <ResourceLink
          groupVersionKind={modelToGroupVersionKind(MigPlanModel)}
          name={migPlanName}
          namespace={getNamespace(obj)}
          onClick={() => navigate(getResourceUrl({ model: MigPlanModel, resource: obj }))}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="storagemigration">
        {t('{{count}} Volumes', { count: getSelectedPVFromMigPlan(obj)?.length ?? 0 })}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="targetsc">
        {targetStorageClasses?.map((storageClass) => (
          <ResourceLink
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
          value={getMigrationPercentage(migMigration, directVolumeMigration)}
          variant={statusMigration.variant}
        />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="started">
        {migMigration?.status?.startTimestamp ? (
          <Timestamp timestamp={migMigration?.status?.startTimestamp} />
        ) : (
          t('Migration plan is pending')
        )}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} className="pf-v6-c-table__action" id="">
        <ActionsDropdown
          actions={storageMigrationActions}
          id="storage-migplans-actions"
          isKebabToggle
        />
      </TableData>
    </>
  );
};

export default StorageMigrationRow;
