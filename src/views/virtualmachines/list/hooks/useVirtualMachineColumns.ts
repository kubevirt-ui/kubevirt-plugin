import { useCallback, useMemo } from 'react';

import { NodeModel, VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import {
  K8sResourceCommon,
  K8sVerb,
  TableColumn,
  useAccessReview,
} from '@openshift-console/dynamic-plugin-sdk';
import { sortable } from '@patternfly/react-table';

import { columnSorting } from './utils/utils';

const useVirtualMachineColumns = (
  namespace: string,
  pagination: { [key: string]: any },
  data: V1VirtualMachine[],
): [TableColumn<K8sResourceCommon>[], TableColumn<K8sResourceCommon>[]] => {
  const { t } = useKubevirtTranslation();

  const [canGetNode] = useAccessReview({
    namespace: namespace,
    verb: 'get' as K8sVerb,
    resource: NodeModel.plural,
  });

  const sorting = useCallback(
    (direction, path) => columnSorting(data, direction, pagination, path),
    [data, pagination],
  );

  const columns: TableColumn<K8sResourceCommon>[] = useMemo(
    () => [
      {
        title: t('Name'),
        id: 'name',
        transforms: [sortable],
        sort: (_, direction) => sorting(direction, 'metadata.name'),
        props: { className: 'pf-m-width-15' },
      },
      ...(!namespace
        ? [
            {
              title: t('Namespace'),
              id: 'namespace',
              transforms: [sortable],
              sort: (_, direction) => sorting(direction, 'metadata.namespace'),
              props: { className: 'pf-m-width-10' },
            },
          ]
        : []),
      {
        title: t('Status'),
        id: 'status',
        transforms: [sortable],
        sort: (_, direction) => sorting(direction, 'status.printableStatus'),
        props: { className: 'pf-m-width-15' },
      },
      {
        title: t('Conditions'),
        id: 'conditions',
        props: { className: 'pf-m-width-20' },
      },
      ...(canGetNode
        ? [
            {
              title: t('Node'),
              id: 'node',
              props: { className: 'pf-m-width-15' },
            },
          ]
        : []),
      {
        title: t('Created'),
        id: 'created',
        transforms: [sortable],
        additional: true,
        sort: (_, direction) => sorting(direction, 'metadata.creationTimestamp'),
        props: { className: 'pf-m-width-15' },
      },
      {
        title: t('IP address'),
        id: 'ip-address',
        props: { className: 'pf-m-width-10' },
      },
      {
        title: '',
        id: '',
        props: { className: 'dropdown-kebab-pf pf-c-table__action' },
      },
    ],
    [canGetNode, namespace, sorting, t],
  );

  const [activeColumns] = useKubevirtUserSettingsTableColumns<K8sResourceCommon>({
    columns: canGetNode ? columns : columns.filter((column) => column.id !== 'node'),
    columnManagementID: VirtualMachineModelRef,
  });

  return [columns, activeColumns];
};

export default useVirtualMachineColumns;
