import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn, useActiveColumns } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

const useVirtualMachineColumns = (): [
  TableColumn<V1VirtualMachine>[],
  TableColumn<V1VirtualMachine>[],
  boolean,
] => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<V1VirtualMachine>[] = useMemo(
    () => [
      {
        id: '',
        props: { className: 'pf-v6-c-table__action' },
        title: '',
      },
      {
        id: 'name',
        sort: 'metadata.name',
        title: t('Name'),
        transforms: [sortable],
      },
      {
        id: 'namespace',
        sort: 'metadata.namespace',
        title: t('Namespace'),
        transforms: [sortable],
      },
      {
        id: 'status',
        sort: 'status.printableStatus',
        title: t('Status'),
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

  const [activeColumns, loaded] = useActiveColumns<V1VirtualMachine>({
    columnManagementID: 'VMNetwork-ConnectedVirtualMachines',
    columns,
    showNamespaceOverride: true,
  });

  return [columns, activeColumns, loaded];
};

export default useVirtualMachineColumns;
