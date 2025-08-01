import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { universalComparator } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';
import { VMIMapper } from '@virtualmachines/utils/mappers';

export const useNodesFilter = (vmiMapper: VMIMapper): RowFilter<V1VirtualMachine> => {
  const sortedNodeNamesItems = useMemo(() => {
    return Object.values(vmiMapper?.nodeNames).sort((a, b) => universalComparator(a?.id, b?.id));
  }, [vmiMapper]);

  return {
    filter: (selectedNodes, vm) => {
      const nodeName = vmiMapper?.mapper?.[getNamespace(vm)]?.[getName(vm)]?.status?.nodeName;
      return selectedNodes.selected?.length === 0 || selectedNodes.selected?.includes(nodeName);
    },
    filterGroupName: 'Node',
    items: sortedNodeNamesItems,
    reducer: (vm) => vmiMapper?.mapper?.[getNamespace(vm)]?.[getName(vm)]?.status?.nodeName,
    type: VirtualMachineRowFilterType.Node,
  };
};
