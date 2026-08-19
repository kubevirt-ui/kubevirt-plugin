import { useMemo } from 'react';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  KubevirtFilter,
  KubevirtFilterLayout,
} from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMINodeName } from '@kubevirt-utils/resources/vmi';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';
import { getVMIFromMapper, VMIMapper } from '@virtualmachines/utils/mappers';
import { getNodes } from './utils';

const useNodeFilter = (vmiMapper: VMIMapper): KubevirtFilter<V1VirtualMachine> => {
  const { t } = useKubevirtTranslation();

  const options = useMemo(
    () => getNodes(vmiMapper).map((node) => ({ label: node, value: node })),
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
