import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { modelToRef } from '@kubevirt-utils/models';
import { MigPlanModel } from '@kubevirt-utils/resources/migrations/constants';
import { columnSortingCompare } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon, TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

import { MigPlanMap } from '../constants';
import {
  compareMigrationStarted,
  compareMigrationStatus,
  compareMigrationStorageClasses,
  compareMigrationVolumes,
} from '../utils';

const useStorageMigrationColumns = (
  migPlanMap: MigPlanMap,
): [TableColumn<K8sResourceCommon>[], TableColumn<K8sResourceCommon>[]] => {
  const { t } = useKubevirtTranslation();

  const columns = useMemo(
    () => [
      {
        id: 'name',
        props: { className: 'pf-m-width-30' },
        sort: 'metadata.name',
        title: t('Name'),
        transforms: [sortable],
      },
      {
        id: 'storagemigration',
        sort: (data, direction) =>
          columnSortingCompare(data, direction, null, compareMigrationVolumes),
        title: t('Storage migration'),
        transforms: [sortable],
      },
      {
        id: 'targetsc',
        sort: (data, direction) =>
          columnSortingCompare(data, direction, null, compareMigrationStorageClasses),
        title: t('Target'),
        transforms: [sortable],
      },
      {
        id: 'status',
        props: { className: 'pf-m-width-20' },
        sort: (data, direction) =>
          columnSortingCompare(data, direction, null, compareMigrationStatus(migPlanMap)),
        title: t('Status'),
        transforms: [sortable],
      },
      {
        id: 'started',
        sort: (data, direction) =>
          columnSortingCompare(data, direction, null, compareMigrationStarted(migPlanMap)),
        title: t('Migration started'),
        transforms: [sortable],
      },
      {
        id: '',
        props: { className: 'pf-v6-c-table__action' },
        title: '',
      },
    ],
    [t, migPlanMap],
  );

  const [activeColumns] = useKubevirtUserSettingsTableColumns<K8sResourceCommon>({
    columnManagementID: modelToRef(MigPlanModel),
    columns,
  });

  return [columns, activeColumns];
};

export default useStorageMigrationColumns;
