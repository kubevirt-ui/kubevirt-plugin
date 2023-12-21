import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  K8sResourceCommon,
  TableColumn,
  useActiveColumns,
} from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

const useVirtualMachinesInstancesColumns = (): { id: string; title: string }[] => {
  const { t } = useKubevirtTranslation();

  const columns: TableColumn<K8sResourceCommon>[] = React.useMemo(
    () => [
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
        sort: 'status.phase',
        title: t('Status'),
        transforms: [sortable],
      },
      {
        id: 'conditions',
        title: t('Conditions'),
      },
      {
        id: 'created',
        sort: 'metadata.creationTimestamp',
        title: t('Created'),
        transforms: [sortable],
      },
      {
        id: 'node',
        sort: 'metadata.creationTimestamp',
        title: t('Node'),
        transforms: [sortable],
      },
      {
        id: 'ipAddress',
        title: t('IP address'),
      },
      {
        id: '',
        props: { className: 'dropdown-kebab-pf pf-v5-c-table__action' },
        title: '',
      },
    ],
    [t],
  );

  const [activeColumns] = useActiveColumns<K8sResourceCommon>({
    columnManagementID: '',
    columns,
    showNamespaceOverride: false,
  });

  return activeColumns;
};

export default useVirtualMachinesInstancesColumns;
