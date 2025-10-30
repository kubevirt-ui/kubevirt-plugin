import { useMemo } from 'react';

import { MigrationPolicyModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsACMPage from '@multicluster/useIsACMPage';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

const useMigrationPoliciesListColumns = (): [
  TableColumn<V1alpha1MigrationPolicy>[],
  TableColumn<V1alpha1MigrationPolicy>[],
  boolean,
] => {
  const { t } = useKubevirtTranslation();
  const isACMPage = useIsACMPage();
  const cluster = useClusterParam();

  const columns: TableColumn<V1alpha1MigrationPolicy>[] = useMemo(
    () => [
      {
        id: 'name',
        props: { className: 'pf-m-width-15' },
        sort: 'metadata.name',
        title: t('Name'),
        transforms: [sortable],
      },
      ...(isACMPage && !cluster
        ? [
            {
              id: 'cluster',
              props: { className: 'pf-m-width-10' },
              sort: 'cluster',
              title: t('Cluster'),
              transforms: [sortable],
            },
          ]
        : []),
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
        title: t('VirtualMachineInstance labels'),
      },
      {
        id: '',
        props: { className: 'pf-v6-c-table__action' },
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
