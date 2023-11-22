import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { vmimStatuses } from '@kubevirt-utils/resources/vmim/statuses';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';

export const getStatusFilter = (): RowFilter[] => [
  {
    filter: (statuses, obj) => {
      const status = obj?.vmim?.status?.phase;

      return statuses?.selected?.length === 0 || statuses?.selected?.includes(status);
    },
    filterGroupName: t('Status'),
    items: Object.keys(vmimStatuses).map((status) => ({
      id: status,
      title: status,
    })),
    reducer: (obj) => obj?.vmim?.status?.phase,
    type: 'status',
  },
];

export const getSourceNodeFilter = (vmis: V1VirtualMachineInstance[]): RowFilter[] => {
  if (vmis?.length === 0 || vmis?.every((vmi) => !vmi?.status?.migrationState?.sourceNode)) {
    return [] as RowFilter[];
  }

  const nodes = new Set(
    (vmis || []).map((vmi) => vmi?.status?.migrationState?.sourceNode)?.filter(Boolean),
  );

  return [
    {
      filter: (selectedNodes, obj) => {
        const nodeName = obj?.vmiObj?.status?.migrationState?.sourceNode;
        return (
          selectedNodes?.selected?.length === 0 ||
          selectedNodes?.selected?.includes(`source-${nodeName}`)
        );
      },
      filterGroupName: t('Source Node'),
      items: Array.from(nodes).map((nodeName) => ({
        id: `source-${nodeName}`,
        title: nodeName,
      })),
      reducer: (obj) => `source-${obj?.vmiObj?.status?.migrationState?.sourceNode}`,
      type: 'source',
    },
  ];
};

export const getTargetNodeFilter = (vmis: V1VirtualMachineInstance[]): RowFilter[] => {
  if (vmis?.length === 0 || vmis?.every((vm) => !vm?.status?.migrationState?.targetNode)) {
    return [] as RowFilter[];
  }

  const nodes = new Set(
    (vmis || []).map((vmi) => vmi?.status?.migrationState?.targetNode)?.filter(Boolean),
  );

  return [
    {
      filter: (selectedNodes, obj) => {
        const nodeName = obj?.vmiObj?.status?.migrationState?.targetNode;
        return (
          selectedNodes?.selected?.length === 0 ||
          selectedNodes?.selected?.includes(`target-${nodeName}`)
        );
      },
      filterGroupName: t('Target Node'),
      items: Array.from(nodes).map((nodeName) => ({
        id: `target-${nodeName}`,
        title: nodeName,
      })),
      reducer: (obj) => {
        return `target-${obj?.vmiObj?.status?.migrationState?.targetNode}`;
      },
      type: 'target',
    },
  ];
};
