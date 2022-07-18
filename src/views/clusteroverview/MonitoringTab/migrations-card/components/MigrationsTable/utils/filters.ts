import { TFunction } from 'react-i18next';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

import { vmimStatuses } from './statuses';

export const getStatusFilter = (t: TFunction): RowFilter[] => [
  {
    filterGroupName: t('Status'),
    type: 'status',
    reducer: (obj) => obj?.vmim?.status?.phase,
    filter: (statuses, obj) => {
      const status = obj?.vmim?.status?.phase;

      return statuses.selected?.length === 0 || statuses.selected?.includes(status);
    },
    items: Object.keys(vmimStatuses).map((status) => ({
      id: status,
      title: status,
    })),
  },
];

export const getSourceNodeFilter = (
  vmis: V1VirtualMachineInstance[],
  t: TFunction,
): RowFilter[] => {
  if (vmis?.length === 0 || vmis?.every((vm) => !vm.status?.migrationState?.sourceNode)) {
    return [] as RowFilter[];
  }

  const nodes = new Set(
    (vmis || []).map((vmi) => vmi.status?.migrationState?.sourceNode)?.filter(Boolean),
  );

  return [
    {
      filterGroupName: t('Source Node'),
      type: 'source',
      reducer: (obj) => {
        return vmis?.find((vmi) => vmi.metadata?.name === obj?.vmiObj?.metadata?.name)?.status
          ?.migrationState?.sourceNode;
      },
      filter: (selectedNodes, obj) => {
        const nodeName = vmis?.find((vmi) => vmi.metadata?.name === obj?.vmiObj?.metadata?.name)
          ?.status?.migrationState?.sourceNode;
        return selectedNodes.selected?.length === 0 || selectedNodes.selected?.includes(nodeName);
      },
      items: Array.from(nodes).map((nodeName) => ({
        id: nodeName,
        title: nodeName,
      })),
    },
  ];
};

export const getTargetNodeFilter = (
  vmis: V1VirtualMachineInstance[],
  t: TFunction,
): RowFilter[] => {
  if (vmis?.length === 0 || vmis?.every((vm) => !vm.status?.migrationState?.targetNode)) {
    return [] as RowFilter[];
  }

  const nodes = new Set(
    (vmis || []).map((vmi) => vmi.status?.migrationState?.targetNode)?.filter(Boolean),
  );

  return [
    {
      filterGroupName: t('Source Node'),
      type: 'source',
      reducer: (obj) => {
        return vmis?.find((vmi) => vmi.metadata?.name === obj?.vmiObj?.metadata?.name)?.status
          ?.migrationState?.targetNode;
      },
      filter: (selectedNodes, obj) => {
        const nodeName = vmis?.find((vmi) => vmi.metadata?.name === obj?.vmiObj?.metadata?.name)
          ?.status?.migrationState?.targetNode;
        return selectedNodes.selected?.length === 0 || selectedNodes.selected?.includes(nodeName);
      },
      items: Array.from(nodes).map((nodeName) => ({
        id: nodeName,
        title: nodeName,
      })),
    },
  ];
};
