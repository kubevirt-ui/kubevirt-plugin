import { useCallback, useMemo } from 'react';

import { VirtualMachinePreferenceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachinePreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { columnSorting } from '@kubevirt-utils/utils/utils';
import { TableColumn, useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

type UseUserPreferenceListColumnsValues = [
  TableColumn<V1beta1VirtualMachinePreference>[],
  TableColumn<V1beta1VirtualMachinePreference>[],
];

type UseUserPreferenceListColumns = (
  pagination: PaginationState,
  data: V1beta1VirtualMachinePreference[],
) => UseUserPreferenceListColumnsValues;

const useUserPreferenceListColumns: UseUserPreferenceListColumns = (pagination, data) => {
  const { t } = useKubevirtTranslation();
  const [activeNamespace] = useActiveNamespace();
  const sorting = useCallback(
    (direction, path) => columnSorting(data, direction, pagination, path),
    [data, pagination],
  );
  const columns: TableColumn<V1beta1VirtualMachinePreference>[] = useMemo(
    () => [
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
        id: 'vendor',
        title: t('Vendor'),
      },
      {
        id: '',
        props: { className: 'dropdown-kebab-pf pf-v5-c-table__action' },
        title: '',
      },
    ],
    [activeNamespace, sorting, t],
  );

  const [activeColumns] = useKubevirtUserSettingsTableColumns<V1beta1VirtualMachinePreference>({
    columnManagementID: VirtualMachinePreferenceModelRef,
    columns,
  });

  return [columns, activeColumns];
};

export default useUserPreferenceListColumns;
