import { useCallback, useMemo } from 'react';

import { NodeModel, VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { columnSorting } from '@kubevirt-utils/utils/utils';
import {
  K8sResourceCommon,
  K8sVerb,
  TableColumn,
  useAccessReview,
} from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

const useVirtualMachineColumns = (
  namespace: string,
  pagination: { [key: string]: any },
  data: V1VirtualMachine[],
): [TableColumn<K8sResourceCommon>[], TableColumn<K8sResourceCommon>[], boolean] => {
  const { t } = useKubevirtTranslation();

  const [canGetNode] = useAccessReview({
    namespace: namespace,
    resource: NodeModel.plural,
    verb: 'get' as K8sVerb,
  });

  const sorting = useCallback(
    (direction, path) => columnSorting(data, direction, pagination, path),
    [data, pagination],
  );

  const columns: TableColumn<K8sResourceCommon>[] = useMemo(
    () => [
      {
        id: 'name',
        sort: (_, direction) => sorting(direction, 'metadata.name'),
        title: t('Name'),
        transforms: [sortable],
      },
      ...(!namespace
        ? [
            {
              id: 'namespace',
              props: { className: 'pf-m-width-10' },
              sort: (_, direction) => sorting(direction, 'metadata.namespace'),
              title: t('Namespace'),
              transforms: [sortable],
            },
          ]
        : []),
      {
        id: 'status',
        props: { className: 'pf-m-width-15' },
        sort: (_, direction) => sorting(direction, 'status.printableStatus'),
        title: t('Status'),
        transforms: [sortable],
      },
      {
        id: 'conditions',
        props: { className: 'pf-m-width-20' },
        title: t('Conditions'),
      },
      ...(canGetNode
        ? [
            {
              id: 'node',
              title: t('Node'),
            },
          ]
        : []),
      {
        additional: true,
        id: 'created',
        sort: (_, direction) => sorting(direction, 'metadata.creationTimestamp'),
        title: t('Created'),
        transforms: [sortable],
      },
      {
        id: 'ip-address',
        props: { className: 'pf-m-width-10' },
        title: t('IP address'),
      },
      {
        id: '',
        props: { className: 'dropdown-kebab-pf pf-v5-c-table__action' },
        title: '',
      },
    ],
    [canGetNode, namespace, sorting, t],
  );

  const [activeColumns, , loaded] = useKubevirtUserSettingsTableColumns<K8sResourceCommon>({
    columnManagementID: VirtualMachineModelRef,
    columns: canGetNode ? columns : columns.filter((column) => column.id !== 'node'),
  });

  return [columns, activeColumns, loaded];
};

export default useVirtualMachineColumns;
