import { useCallback } from 'react';

import { VirtualMachineInstancetypeModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { columnSorting } from '@kubevirt-utils/utils/utils';
import { TableColumn, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

type UseUserInstancetypeListColumnsValues = [
  TableColumn<V1beta1VirtualMachineInstancetype>[],
  TableColumn<V1beta1VirtualMachineInstancetype>[],
  boolean,
];

type UseUserInstancetypeListColumns = (
  pagination: PaginationState,
  data: V1beta1VirtualMachineInstancetype[],
) => UseUserInstancetypeListColumnsValues;

const useUserInstancetypeListColumns: UseUserInstancetypeListColumns = (pagination, data) => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();

  const sorting = useCallback(
    (direction, path) => columnSorting(data, direction, pagination, path),
    [data, pagination],
  );

  const columns: TableColumn<V1beta1VirtualMachineInstancetype>[] = [
    {
      id: 'name',
      sort: (_, direction) => sorting(direction, 'metadata.name'),
      title: t('Name'),
      transforms: [sortable],
    },
    ...(activeNamespace === ALL_NAMESPACES_SESSION_KEY
      ? [
          {
            id: 'namespace',
            sort: (_, direction) => sorting(direction, 'metadata.namespace'),
            title: t('Namespace'),
            transforms: [sortable],
          },
        ]
      : []),
    {
      id: 'cpu',
      sort: (_, direction) => sorting(direction, 'spec.cpu.guest'),
      title: t('CPU'),
      transforms: [sortable],
    },
    {
      id: 'memory',
      sort: (_, direction) => sorting(direction, 'spec.memory.guest'),
      title: t('Memory'),
      transforms: [sortable],
    },
    {
      id: 'vendor',
      title: t('Vendor'),
    },
    {
      id: '',
      props: { className: 'dropdown-kebab-pf pf-v5-c-table__action' },
      title: '',
    },
  ];
  const [activeColumns, , loadedColumns] =
    useKubevirtUserSettingsTableColumns<V1beta1VirtualMachineInstancetype>({
      columnManagementID: VirtualMachineInstancetypeModelRef,
      columns,
    });

  return [columns, activeColumns, loadedColumns];
};

export default useUserInstancetypeListColumns;
