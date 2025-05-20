import { useMemo } from 'react';

import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';
import { VMIMapper } from '@virtualmachines/utils/mappers';

export const useNodesFilter = (vmiMapper: VMIMapper): RowFilter => {
  const sortedNodeNamesItems = useMemo(() => {
    return Object.values(vmiMapper?.nodeNames).sort((a, b) =>
      a?.id?.localeCompare(b?.id, undefined, {
        numeric: true,
        sensitivity: 'base',
      }),
    );
  }, [vmiMapper]);

  return {
    filter: (selectedNodes, obj) => {
      const nodeName =
        vmiMapper?.mapper?.[obj?.metadata?.namespace]?.[obj?.metadata?.name]?.status?.nodeName;
      return selectedNodes.selected?.length === 0 || selectedNodes.selected?.includes(nodeName);
    },
    filterGroupName: 'Node',
    items: sortedNodeNamesItems,
    reducer: (obj) =>
      vmiMapper?.mapper?.[obj?.metadata?.namespace]?.[obj?.metadata?.name]?.status?.nodeName,
    type: VirtualMachineRowFilterType.Node,
  };
};
