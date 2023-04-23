import { useMemo } from 'react';

import { VirtualMachineClusterPreferenceModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha2VirtualMachineClusterPreference } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { TableColumn, useActiveColumns } from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

const useClusterPreferenceListColumns = (): [
  TableColumn<V1alpha2VirtualMachineClusterPreference>[],
  TableColumn<V1alpha2VirtualMachineClusterPreference>[],
] => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<V1alpha2VirtualMachineClusterPreference>[] = useMemo(
    () => [
      {
        title: t('Name'),
        id: 'name',
        transforms: [sortable],
        sort: 'metadata.name',
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
    [t],
  );

  const [activeColumns] = useActiveColumns<V1alpha2VirtualMachineClusterPreference>({
    columns,
    showNamespaceOverride: false,
    columnManagementID: VirtualMachineClusterPreferenceModelRef,
  });
  return [columns, activeColumns];
};

export default useClusterPreferenceListColumns;
