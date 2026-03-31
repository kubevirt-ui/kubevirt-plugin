import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMINodeName } from '@kubevirt-utils/resources/vmi';
import { universalComparator } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';
import { getVMIFromMapper, VMIMapper } from '@virtualmachines/utils/mappers';

export const useNodesFilter = (vmiMapper: VMIMapper): RowFilter<V1VirtualMachine> => {
  const { t } = useKubevirtTranslation();

  const sortedNodeNamesItems = useMemo(() => {
    return Object.values(vmiMapper?.nodeNames).sort((a, b) => universalComparator(a?.id, b?.id));
  }, [vmiMapper]);

  return {
    filter: (selectedNodes, vm) => {
      const nodeName = getVMINodeName(getVMIFromMapper(vmiMapper, vm));
      return selectedNodes.selected?.length === 0 || selectedNodes.selected?.includes(nodeName);
    },
    filterGroupName: t('Node'),
    items: sortedNodeNamesItems,
    reducer: (vm) => getVMINodeName(getVMIFromMapper(vmiMapper, vm)),
    type: VirtualMachineRowFilterType.Node,
  };
};
