import React from 'react';

import { V1alpha1MigrationPolicy } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

const useMigrationPoliciesListColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<V1alpha1MigrationPolicy>[] = React.useMemo(
    () => [
      {
        title: t('MigrationPolicy name'),
        id: 'name',
        transforms: [sortable],
        sort: 'metadata.name',
        props: { className: 'pf-m-width-15' },
      },
      {
        title: t('Bandwidth'),
        id: 'bandwidth',
        transforms: [sortable],
        sort: 'spec.bandwidthPerMigration',
        props: { className: 'pf-m-width-10' },
      },
      {
        title: t('Auto converge'),
        id: 'auto-converge',
        transforms: [sortable],
        sort: 'spec.allowAutoConverge',
        props: { className: 'pf-m-width-10' },
      },
      {
        title: t('Post copy'),
        id: 'post-copy',
        transforms: [sortable],
        sort: 'spec.allowPostCopy',
        props: { className: 'pf-m-width-10' },
      },
      {
        title: t('Completion timeout'),
        id: 'completion-timeout',
        transforms: [sortable],
        sort: 'spec.completionTimeoutPerGiB',
        props: { className: 'pf-m-width-10' },
      },
      {
        title: t('Project labels'),
        id: 'project-labels',
      },
      {
        title: t('VirtualMachine labels'),
        id: 'vm-labels',
      },
      {
        title: '',
        id: 'actions',
        props: { className: 'dropdown-kebab-pf pf-c-table__action' },
      },
    ],
    [t],
  );

  return columns;
};

export default useMigrationPoliciesListColumns;
