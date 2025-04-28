import { useCallback, useMemo } from 'react';

import { NodeModel, VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
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
import { PVCMapper, VMIMapper } from '@virtualmachines/utils/mappers';

import {
  sortByCPUUsage,
  sortByDeletionProtection,
  sortByMemoryUsage,
  sortByNetworkUsage,
  sortByNode,
  sortByStorageclassName,
} from './sortColumns';

const useVirtualMachineColumns = (
  namespace: string,
  vmiMapper: VMIMapper,
  pvcMapper: PVCMapper,
): [TableColumn<K8sResourceCommon>[], TableColumn<K8sResourceCommon>[], boolean] => {
  const { t } = useKubevirtTranslation();

  const [canGetNode] = useAccessReview({
    namespace: namespace,
    resource: NodeModel.plural,
    verb: 'get' as K8sVerb,
  });

  const sorting = useCallback(
    (dataToSort, direction, path) => columnSorting(dataToSort, direction, null, path),
    [],
  );

  const sortingUsingFunction = useCallback(
    (dataToSort, direction, compareFunction) => compareFunction(dataToSort, direction, null),
    [],
  );

  const sortingUsingFunctionWithMapper = useCallback(
    (dataToSort, direction, compareFunction) =>
      compareFunction(dataToSort, direction, null, vmiMapper),
    [vmiMapper],
  );

  const sortingUsingFunctionWithPVCMapper = useCallback(
    (dataToSort, direction, compareFunction) =>
      compareFunction(dataToSort, direction, null, pvcMapper),
    [pvcMapper],
  );

  const columns: TableColumn<K8sResourceCommon>[] = useMemo(
    () => [
      {
        id: '',
        props: { className: 'pf-v6-c-table__action' },
        title: '',
      },
      {
        id: 'name',
        props: { className: 'pf-m-width-20' },
        sort: (data, direction) => sorting(data, direction, 'metadata.name'),
        title: t('Name'),
        transforms: [sortable],
      },
      ...(!namespace
        ? [
            {
              id: 'namespace',
              sort: (data, direction) => sorting(data, direction, 'metadata.namespace'),
              title: t('Namespace'),
              transforms: [sortable],
            },
          ]
        : []),
      {
        id: 'status',
        sort: (data, direction) => sorting(data, direction, 'status.printableStatus'),
        title: t('Status'),
        transforms: [sortable],
      },
      {
        id: 'conditions',
        title: t('Conditions'),
      },
      ...(canGetNode
        ? [
            {
              id: 'node',
              sort: (data, direction) =>
                sortingUsingFunctionWithMapper(data, direction, sortByNode),
              title: t('Node'),
              transforms: [sortable],
            },
          ]
        : []),
      {
        additional: true,
        id: 'created',
        sort: (data, direction) => sorting(data, direction, 'metadata.creationTimestamp'),
        title: t('Created'),
        transforms: [sortable],
      },
      {
        id: 'ip-address',
        title: t('IP address'),
      },
      {
        additional: true,
        id: 'memory-usage',
        sort: (data, direction) =>
          sortingUsingFunctionWithMapper(data, direction, sortByMemoryUsage),
        title: t('Memory'),
        transforms: [sortable],
      },
      {
        additional: true,
        id: 'cpu-usage',
        sort: (data, direction) => sortingUsingFunction(data, direction, sortByCPUUsage),
        title: t('CPU'),
        transforms: [sortable],
      },
      {
        additional: true,
        id: 'network-usage',
        sort: (data, direction) => sortingUsingFunction(data, direction, sortByNetworkUsage),
        title: t('Network'),
        transforms: [sortable],
      },
      {
        additional: true,
        id: 'deletion-protection',
        sort: (data, direction) => sortingUsingFunction(data, direction, sortByDeletionProtection),
        title: t('Deletion protection'),
        transforms: [sortable],
      },
      {
        additional: true,
        id: 'storageclassname',
        sort: (data, direction) =>
          sortingUsingFunctionWithPVCMapper(data, direction, sortByStorageclassName),
        title: t('Storage class'),
        transforms: [sortable],
      },
      {
        id: '',
        props: { className: 'pf-v6-c-table__action' },
        title: '',
      },
    ],
    [
      canGetNode,
      namespace,
      sorting,
      sortingUsingFunction,
      sortingUsingFunctionWithMapper,
      sortingUsingFunctionWithPVCMapper,
      t,
    ],
  );

  const [activeColumns, , loaded] = useKubevirtUserSettingsTableColumns<K8sResourceCommon>({
    columnManagementID: VirtualMachineModelRef,
    columns: canGetNode ? columns : columns.filter((column) => column.id !== 'node'),
  });

  return [columns, activeColumns, loaded];
};

export default useVirtualMachineColumns;
