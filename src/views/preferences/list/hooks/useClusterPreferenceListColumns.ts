import { useCallback, useMemo } from 'react';

import { VirtualMachineClusterPreferenceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { PaginationState } from '@kubevirt-utils/hooks/usePagination/utils/types';
import { columnSorting } from '@kubevirt-utils/utils/utils';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

type UseClusterPreferenceListColumnsValues = [
  TableColumn<V1alpha2VirtualMachineClusterPreference>[],
  TableColumn<V1alpha2VirtualMachineClusterPreference>[],
];

type UseClusterPreferenceListColumns = (
  pagination: PaginationState,
  data: V1alpha2VirtualMachineClusterPreference[],
) => UseClusterPreferenceListColumnsValues;

const useClusterPreferenceListColumns: UseClusterPreferenceListColumns = (pagination, data) => {
  const { t } = useKubevirtTranslation();

  const sorting = useCallback(
    (direction, path) => columnSorting(data, direction, pagination, path),
    [data, pagination],
  );
  const columns: TableColumn<V1alpha2VirtualMachineClusterPreference>[] = useMemo(
    () => [
      {
        title: t('Name'),
        id: 'name',
        transforms: [sortable],
        sort: (_, direction) => sorting(direction, 'metadata.name'),
      },
      {
        title: t('Vendor'),
        id: 'vendor',
      },
      {
        title: '',
        id: '',
        props: { className: 'dropdown-kebab-pf pf-c-table__action' },
      },
    ],
    [sorting, t],
  );

  const [activeColumns] =
    useKubevirtUserSettingsTableColumns<V1alpha2VirtualMachineClusterPreference>({
      columns,
      columnManagementID: VirtualMachineClusterPreferenceModelRef,
    });

  return [columns, activeColumns];
};

export default useClusterPreferenceListColumns;
