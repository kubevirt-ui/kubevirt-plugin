import * as React from 'react';

import { NodeModel } from '@kubevirt-ui/kubevirt-api/console';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  K8sResourceCommon,
  K8sVerb,
  TableColumn,
  useAccessReview,
  useActiveColumns,
} from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

const useVirtualMachineColumns = (namespace: string) => {
  const { t } = useKubevirtTranslation();

  const [canGetNode] = useAccessReview({
    namespace: namespace,
    verb: 'get' as K8sVerb,
    resource: NodeModel.plural,
  });

  const columns: TableColumn<K8sResourceCommon>[] = React.useMemo(
    () => [
      {
        title: t('Name'),
        id: 'name',
        transforms: [sortable],
        sort: 'metadata.name',
        props: { className: 'pf-m-width-15' },
      },
      {
        title: t('Namespace'),
        id: 'namespace',
        transforms: [sortable],
        sort: 'metadata.namespace',
        props: { className: 'pf-m-width-10' },
      },
      {
        title: t('Status'),
        id: 'status',
        transforms: [sortable],
        sort: 'status.printableStatus',
        props: { className: 'pf-m-width-10' },
      },
      {
        title: t('Conditions'),
        id: 'conditions',
        props: { className: 'pf-m-width-20' },
      },
      {
        title: t('Node'),
        id: 'node',
        props: { className: 'pf-m-width-15' },
      },
      {
        title: t('Created'),
        id: 'created',
        transforms: [sortable],
        sort: 'metadata.creationTimestamp',
        props: { className: 'pf-m-width-15' },
      },
      {
        title: t('IP address'),
        id: 'ip-address',
        props: { className: 'pf-m-width-10' },
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
    columns: canGetNode ? columns : columns.filter((column) => column.id !== 'node'),
    showNamespaceOverride: false,
    columnManagementID: '',
  });

  return activeColumns;
};

export default useVirtualMachineColumns;
