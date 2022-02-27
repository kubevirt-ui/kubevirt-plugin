import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  K8sResourceCommon,
  TableColumn,
  useActiveColumns,
} from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

export const columnsStringSortingSubField =
  <T>(field: string, subField: string) =>
  (data: Array<T>, direction: string) =>
    data?.sort((a, b) =>
      direction === 'asc'
        ? a?.[field]?.[subField]?.localeCompare(b?.[field]?.[subField])
        : b?.[field]?.[subField]?.localeCompare(a?.[field]?.[subField]),
    );

const useVirtualMachineColumns = () => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<K8sResourceCommon>[] = React.useMemo(
    () => [
      {
        title: t('Name'),
        id: 'name',
        transforms: [sortable],
        sort: columnsStringSortingSubField<K8sResourceCommon>('metadata', 'name'),
      },
      {
        title: t('Namespace'),
        id: 'namespace',
        transforms: [sortable],
        sort: columnsStringSortingSubField<K8sResourceCommon>('metadata', 'namespace'),
      },
      {
        title: t('Status'),
        id: 'status',
        transforms: [sortable],
        sort: columnsStringSortingSubField<K8sResourceCommon>('status', 'printableStatus'),
      },
      {
        title: t('Conditions'),
        id: 'conditions',
      },
      {
        title: t('Node'),
        id: 'node',
      },
      {
        title: t('Created'),
        id: 'created',
        transforms: [sortable],
        sort: columnsStringSortingSubField<K8sResourceCommon>('metadata', 'creationTimestamp'),
      },
      {
        title: t('IP address'),
        id: 'ip-address',
      },
      {
        title: '',
        id: 'actions',
        props: { className: 'dropdown-kebab-pf pf-c-table__action' },
      },
    ],
    [t],
  );

  const [activeColumns] = useActiveColumns<K8sResourceCommon>({
    columns,
    showNamespaceOverride: false,
    columnManagementID: '',
  });

  return activeColumns;
};

export default useVirtualMachineColumns;
