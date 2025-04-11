import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { modelToRef } from '@kubevirt-utils/models';
import { MigPlan, MigPlanModel } from '@kubevirt-utils/resources/migrations/constants';
import { getMigMigrationStartTimestamp } from '@kubevirt-utils/resources/migrations/utils';
import { getName } from '@kubevirt-utils/resources/shared';
import { columnSortingCompare } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon, TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

import { getMigrationPercentage } from '../components/utils';
import { MigPlanMap } from '../constants';
import { compareMigrationStorageClasses, compareMigrationVolumes } from '../utils';

const useStorageMigrationColumns = (
  migPlanMap: MigPlanMap,
): [TableColumn<K8sResourceCommon>[], TableColumn<K8sResourceCommon>[]] => {
  const { t } = useKubevirtTranslation();

  const compareMigrationStarted = (a: MigPlan, b: MigPlan) => {
    const aMigration = migPlanMap[getName(a)]?.migMigration;
    const bMigration = migPlanMap[getName(b)]?.migMigration;

    const aStarted = getMigMigrationStartTimestamp(aMigration);
    const bStarted = getMigMigrationStartTimestamp(bMigration);
    return aStarted?.localeCompare(bStarted);
  };

  const compareMigrationStatus = (a: MigPlan, b: MigPlan) => {
    const aMigration = migPlanMap[getName(a)]?.migMigration;
    const aDirectVolumeMigration = migPlanMap[getName(a)]?.directVolumeMigration;
    const bMigration = migPlanMap[getName(b)]?.migMigration;
    const bDirectVolumeMigration = migPlanMap[getName(b)]?.directVolumeMigration;

    const aStarted = getMigrationPercentage(aMigration, aDirectVolumeMigration);
    const bStarted = getMigrationPercentage(bMigration, bDirectVolumeMigration);
    return aStarted - bStarted;
  };

  const columns = [
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
      props: { className: 'dropdown-kebab-pf pf-v6-c-table__action' },
      title: '',
    },
  ];

  const [activeColumns] = useKubevirtUserSettingsTableColumns<K8sResourceCommon>({
    columnManagementID: modelToRef(MigPlanModel),
    columns,
  });

  return [columns, activeColumns];
};

export default useStorageMigrationColumns;
