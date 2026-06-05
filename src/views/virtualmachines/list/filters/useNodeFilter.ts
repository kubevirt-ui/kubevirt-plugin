import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  KubevirtFilter,
  KubevirtFilterLayout,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMINodeName } from '@kubevirt-utils/resources/vmi';
import { universalComparator } from '@kubevirt-utils/utils/utils';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';
import { getVMIFromMapper, VMIMapper } from '@virtualmachines/utils/mappers';

const useNodeFilter = (vmiMapper: VMIMapper): KubevirtFilter<V1VirtualMachine> => {
  const { t } = useKubevirtTranslation();

  const options = useMemo(
    () =>
      Object.values(vmiMapper?.nodeNames)
        .sort((a, b) => universalComparator(a?.id, b?.id))
        .map((node) => ({ label: node.id, value: node.id })),
    [vmiMapper],
  );

  return useMemo(
    () => ({
      categoryLabel: t('Node'),
      filterLayout: KubevirtFilterLayout.SELECT,
      id: VirtualMachineRowFilterType.Node,
      match: (obj: V1VirtualMachine, selected: string[]) => {
        const nodeName = getVMINodeName(getVMIFromMapper(vmiMapper, obj));
        return selected.includes(nodeName);
      },
      options,
    }),
    [t, options, vmiMapper],
  );
};

export default useNodeFilter;
