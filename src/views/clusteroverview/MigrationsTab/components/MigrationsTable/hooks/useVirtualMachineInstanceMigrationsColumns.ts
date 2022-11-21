import * as React from 'react';

import {
  NodeModel,
  VirtualMachineInstanceMigrationModelRef,
} from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  K8sVerb,
  TableColumn,
  useAccessReview,
  useActiveColumns,
} from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

import { MigrationTableDataLayout } from '../utils/utils';

const useVirtualMachineInstanceMigrationsColumns = (): [
  TableColumn<MigrationTableDataLayout>[],
  TableColumn<MigrationTableDataLayout>[],
] => {
  const { t } = useKubevirtTranslation();

  const [canGetNode] = useAccessReview({
    verb: 'get' as K8sVerb,
    resource: NodeModel.plural,
  });

  const columns: TableColumn<MigrationTableDataLayout>[] = React.useMemo(
    () => [
      {
        title: t('VirtualMachine name'),
        id: 'vm-name',
        transforms: [sortable],
        sort: 'vmim.spec.vmiName',
      },
      {
        title: t('Status'),
        id: 'status',
        transforms: [sortable],
        sort: 'vmim.status.phase',
      },
      {
        title: t('Source'),
        id: 'source',
        transforms: [sortable],
        sort: 'vmiObj.status.migrationState.sourceNode',
      },
      {
        title: t('Target'),
        id: 'target',
        transforms: [sortable],
        sort: 'vmiObj.status.migrationState.targetNode',
      },
      {
        title: t('MigrationPolicy'),
        id: 'migration-policy',
        transforms: [sortable],
        sort: 'vmiObj.status.migrationState.migrationPolicyName',
      },
      {
        title: t('VirtualMachineInstanceMigration name'),
        id: 'vmim-name',
        transforms: [sortable],
        sort: 'vmim.metadata.name',
      },
      {
        title: t('Created'),
        id: 'created',
        additional: true,
        transforms: [sortable],
        sort: 'vmim.metadata.creationTimestamp',
      },
      {
        title: '',
        id: '',
        props: { className: 'dropdown-kebab-pf pf-c-table__action' },
      },
    ],
    [t],
  );

  const [activeColumns] = useActiveColumns<MigrationTableDataLayout>({
    columns: canGetNode
      ? columns
      : columns.filter((column) => column.id !== 'source' && column.id !== 'target'),
    showNamespaceOverride: false,
    columnManagementID: VirtualMachineInstanceMigrationModelRef,
  });

  return [columns, activeColumns];
};

export default useVirtualMachineInstanceMigrationsColumns;
