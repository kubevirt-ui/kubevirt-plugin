import {
  NodeModel,
  VirtualMachineInstanceMigrationModelRef,
} from '@kubevirt-ui/kubevirt-api/console';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import {
  K8sVerb,
  TableColumn,
  useAccessReview,
  useActiveNamespace,
} from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

import { MigrationTableDataLayout } from '../utils/utils';

const useVirtualMachineInstanceMigrationsColumns = (): [
  TableColumn<MigrationTableDataLayout>[],
  TableColumn<MigrationTableDataLayout>[],
] => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const [canGetNode] = useAccessReview({
    resource: NodeModel.plural,
    verb: 'get' as K8sVerb,
  });

  const columns: TableColumn<MigrationTableDataLayout>[] = [
    {
      id: 'vm-name',
      sort: 'vmim.spec.vmiName',
      title: t('VirtualMachine name'),
      transforms: [sortable],
    },
    ...(activeNamespace === ALL_NAMESPACES_SESSION_KEY
      ? [
          {
            id: 'namespace',
            props: { className: 'pf-m-width-10' },
            title: t('Namespace'),
            transforms: [sortable],
          },
        ]
      : []),
    {
      id: 'status',
      sort: 'vmim.status.phase',
      title: t('Status'),
      transforms: [sortable],
    },
    {
      id: 'source',
      sort: 'vmiObj.status.migrationState.sourceNode',
      title: t('Source'),
      transforms: [sortable],
    },
    {
      id: 'target',
      sort: 'vmiObj.status.migrationState.targetNode',
      title: t('Target'),
      transforms: [sortable],
    },
    {
      id: 'migration-policy',
      sort: 'vmiObj.status.migrationState.migrationPolicyName',
      title: t('MigrationPolicy'),
      transforms: [sortable],
    },
    {
      id: 'vmim-name',
      sort: 'vmim.metadata.name',
      title: t('VirtualMachineInstanceMigration name'),
      transforms: [sortable],
    },
    {
      additional: true,
      id: 'created',
      sort: 'vmim.metadata.creationTimestamp',
      title: t('Created'),
      transforms: [sortable],
    },
    {
      id: '',
      props: { className: 'dropdown-kebab-pf pf-v5-c-table__action' },
      title: '',
    },
  ];

  const [activeColumns] = useKubevirtUserSettingsTableColumns<MigrationTableDataLayout>({
    columnManagementID: VirtualMachineInstanceMigrationModelRef,
    columns: canGetNode
      ? columns
      : columns.filter((column) => column.id !== 'source' && column.id !== 'target'),
  });

  return [columns, activeColumns];
};

export default useVirtualMachineInstanceMigrationsColumns;
