import React from 'react';

import { MigrationPolicyModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

const useMigrationPoliciesListColumns = (): [
  TableColumn<V1alpha1MigrationPolicy>[],
  TableColumn<V1alpha1MigrationPolicy>[],
  boolean,
] => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<V1alpha1MigrationPolicy>[] = React.useMemo(
    () => [
      {
        id: 'name',
        props: { className: 'pf-m-width-15' },
        sort: 'metadata.name',
        title: t('Name'),
        transforms: [sortable],
      },
      {
        id: 'bandwidth',
        props: { className: 'pf-m-width-10' },
        sort: 'spec.bandwidthPerMigration',
        title: t('Bandwidth'),
        transforms: [sortable],
      },
      {
        id: 'auto-converge',
        props: { className: 'pf-m-width-10' },
        sort: 'spec.allowAutoConverge',
        title: t('Auto converge'),
        transforms: [sortable],
      },
      {
        id: 'post-copy',
        props: { className: 'pf-m-width-10' },
        sort: 'spec.allowPostCopy',
        title: t('Post copy'),
        transforms: [sortable],
      },
      {
        id: 'completion-timeout',
        props: { className: 'pf-m-width-10' },
        sort: 'spec.completionTimeoutPerGiB',
        title: t('Completion timeout'),
        transforms: [sortable],
      },
      {
        additional: true,
        id: 'project-labels',
        title: t('Project labels'),
      },
      {
        additional: true,
        id: 'vm-labels',
        title: t('VirtualMachine labels'),
      },
      {
        id: '',
        props: { className: 'dropdown-kebab-pf pf-v5-c-table__action' },
        title: '',
      },
    ],
    [t],
  );

  const [activeColumns, , loadedColumns] =
    useKubevirtUserSettingsTableColumns<V1alpha1MigrationPolicy>({
      columnManagementID: MigrationPolicyModelRef,
      columns,
    });

  return [columns, activeColumns, loadedColumns];
};

export default useMigrationPoliciesListColumns;
