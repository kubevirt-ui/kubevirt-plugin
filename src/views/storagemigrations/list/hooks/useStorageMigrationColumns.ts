import { useMemo } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import {
  modelToRef,
  MultiNamespaceVirtualMachineStorageMigrationPlanModel,
} from '@kubevirt-utils/models';
import { MultiNamespaceVirtualMachineStorageMigrationPlan } from '@kubevirt-utils/resources/migrations/constants';
import { columnSortingCompare } from '@kubevirt-utils/utils/utils';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

import {
  compareMigrationNamespaces,
  compareMigrationStarted,
  compareMigrationStatus,
  compareMigrationStorageClasses,
  compareMigrationVolumes,
} from '../utils';

const useStorageMigrationColumns = (): [
  TableColumn<MultiNamespaceVirtualMachineStorageMigrationPlan>[],
  TableColumn<MultiNamespaceVirtualMachineStorageMigrationPlan>[],
] => {
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
        id: 'namespaces',
        sort: (data, direction) =>
          columnSortingCompare(data, direction, null, compareMigrationNamespaces),
        title: t('Namespaces'),
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
          columnSortingCompare(data, direction, null, compareMigrationStatus),
        title: t('Status'),
        transforms: [sortable],
      },
      {
        id: 'started',
        sort: (data, direction) =>
          columnSortingCompare(data, direction, null, compareMigrationStarted),
        title: t('Migration started'),
        transforms: [sortable],
      },
      {
        id: '',
        props: { className: 'pf-v6-c-table__action' },
        title: '',
      },
    ],
    [t],
  );

  const [activeColumns] =
    useKubevirtUserSettingsTableColumns<MultiNamespaceVirtualMachineStorageMigrationPlan>({
      columnManagementID: modelToRef(MultiNamespaceVirtualMachineStorageMigrationPlanModel),
      columns,
    });

  return [columns, activeColumns];
};

export default useStorageMigrationColumns;
