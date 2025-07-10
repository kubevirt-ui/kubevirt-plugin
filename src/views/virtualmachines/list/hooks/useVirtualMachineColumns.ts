import { useCallback, useMemo } from 'react';

import { NodeModel, VirtualMachineModelRef } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useKubevirtUserSettingsTableColumns from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { columnSorting } from '@kubevirt-utils/utils/utils';
import useIsACMPage from '@multicluster/useIsACMPage';
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
  pagination: { [key: string]: any },
  data: V1VirtualMachine[],
  vmiMapper: VMIMapper,
  pvcMapper: PVCMapper,
): [TableColumn<K8sResourceCommon>[], TableColumn<K8sResourceCommon>[], boolean] => {
  const { t } = useKubevirtTranslation();

  const isACMPage = useIsACMPage();

  const [canGetNode] = useAccessReview({
    namespace: namespace,
    resource: NodeModel.plural,
    verb: 'get' as K8sVerb,
  });

  const sorting = useCallback(
    (direction, path) => columnSorting(data, direction, pagination, path),
    [data, pagination],
  );

  const sortingUsingFunction = useCallback(
    (direction, compareFunction) => compareFunction(data, direction, pagination),
    [data, pagination],
  );

  const sortingUsingFunctionWithMapper = useCallback(
    (direction, compareFunction) => compareFunction(data, direction, pagination, vmiMapper),
    [data, pagination, vmiMapper],
  );

  const sortingUsingFunctionWithPVCMapper = useCallback(
    (direction, compareFunction) => compareFunction(data, direction, pagination, pvcMapper),
    [data, pagination, pvcMapper],
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
        sort: (_, direction) => sorting(direction, 'metadata.name'),
        title: t('Name'),
        transforms: [sortable],
      },
      ...(isACMPage
        ? [
            {
              id: 'cluster',
              sort: (_, direction) => sorting(direction, 'cluster'),
              title: t('Cluster'),
              transforms: [sortable],
            },
          ]
        : []),
      ...(!namespace
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
        id: 'status',
        sort: (_, direction) => sorting(direction, 'status.printableStatus'),
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
              sort: (_, direction) => sortingUsingFunctionWithMapper(direction, sortByNode),
              title: t('Node'),
              transforms: [sortable],
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
        title: t('IP address'),
      },
      {
        additional: true,
        id: 'memory-usage',
        sort: (_, direction) => sortingUsingFunctionWithMapper(direction, sortByMemoryUsage),
        title: t('Memory'),
        transforms: [sortable],
      },
      {
        additional: true,
        id: 'cpu-usage',
        sort: (_, direction) => sortingUsingFunction(direction, sortByCPUUsage),
        title: t('CPU'),
        transforms: [sortable],
      },
      {
        additional: true,
        id: 'network-usage',
        sort: (_, direction) => sortingUsingFunction(direction, sortByNetworkUsage),
        title: t('Network'),
        transforms: [sortable],
      },
      {
        additional: true,
        id: 'deletion-protection',
        sort: (_, direction) => sortingUsingFunction(direction, sortByDeletionProtection),
        title: t('Deletion protection'),
        transforms: [sortable],
      },
      {
        additional: true,
        id: 'storageclassname',
        sort: (_, direction) =>
          sortingUsingFunctionWithPVCMapper(direction, sortByStorageclassName),
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
