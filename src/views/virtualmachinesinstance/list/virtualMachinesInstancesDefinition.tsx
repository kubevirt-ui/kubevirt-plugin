import React from 'react';
import format from 'date-fns/format';
import { TFunction } from 'i18next';
import { VMStatusConditionLabelList } from 'src/views/virtualmachines/list/components/VMStatusConditionLabel';

import { NodeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getK8sRowId } from '@kubevirt-utils/components/KubevirtTable/utils';
import { ColumnConfig } from '@kubevirt-utils/hooks/useDataViewTableSort/types';
import { ACTIONS } from '@kubevirt-utils/hooks/useKubevirtUserSettings/utils/const';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';
import { GlobeAmericasIcon } from '@patternfly/react-icons';

import VirtualMachinesInstancesIP from '../components/VirtualMachinesInstanceIP';
import VirtualMachinesInstancesStatus from '../components/VirtualMachinesInstancesStatus';

import VMIActionsCell from './cells/VMIActionsCell';
import VMINameCell from './cells/VMINameCell';

export const VMI_COLUMN_KEYS = {
  conditions: 'conditions',
  created: 'created',
  ipAddress: 'ipAddress',
  name: 'name',
  namespace: 'namespace',
  node: 'node',
  status: 'status',
} as const;

export const getVMIColumns = (
  t: TFunction,
  namespace: string,
): ColumnConfig<V1VirtualMachineInstance>[] => {
  const columns: ColumnConfig<V1VirtualMachineInstance>[] = [
    {
      getValue: (row) => getName(row) ?? '',
      key: VMI_COLUMN_KEYS.name,
      label: t('Name'),
      renderCell: (row) => <VMINameCell row={row} />,
      sortable: true,
    },
  ];

  if (!namespace) {
    columns.push({
      getValue: (row) => getNamespace(row) ?? '',
      key: VMI_COLUMN_KEYS.namespace,
      label: t('Namespace'),
      renderCell: (row) => <ResourceLink kind="Namespace" name={getNamespace(row)} />,
      sortable: true,
    });
  }

  columns.push(
    {
      getValue: (row) => row?.status?.phase ?? '',
      key: VMI_COLUMN_KEYS.status,
      label: t('Status'),
      renderCell: (row) => <VirtualMachinesInstancesStatus status={row?.status?.phase} />,
      sortable: true,
    },
    {
      getValue: () => '',
      key: VMI_COLUMN_KEYS.conditions,
      label: t('Conditions'),
      renderCell: (row) => (
        <VMStatusConditionLabelList conditions={row?.status?.conditions?.filter((c) => c.reason)} />
      ),
    },
    {
      getValue: (row) => row?.metadata?.creationTimestamp ?? '',
      key: VMI_COLUMN_KEYS.created,
      label: t('Created'),
      renderCell: (row) => {
        const creationTimestamp = row?.metadata?.creationTimestamp;
        if (!creationTimestamp) return null;
        return (
          <>
            <GlobeAmericasIcon /> {format(new Date(creationTimestamp), 'MMM dd, yyyy, h:mm a')}
          </>
        );
      },
      sortable: true,
    },
    {
      getValue: (row) => row?.status?.nodeName ?? '',
      key: VMI_COLUMN_KEYS.node,
      label: t('Node'),
      renderCell: (row) => {
        const nodeName = row?.status?.nodeName;
        if (!nodeName) return null;
        return <ResourceLink kind={NodeModel.kind} name={nodeName} />;
      },
      sortable: true,
    },
    {
      getValue: () => '',
      key: VMI_COLUMN_KEYS.ipAddress,
      label: t('IP address'),
      renderCell: (row) => <VirtualMachinesInstancesIP vmi={row} />,
    },
    {
      key: ACTIONS,
      label: '',
      props: { className: 'pf-v6-c-table__action' },
      renderCell: (row) => <VMIActionsCell row={row} />,
    },
  );

  return columns;
};

export const getVMIRowId = (vmi: V1VirtualMachineInstance, index: number): string =>
  getK8sRowId(vmi, index, 'vmi');
