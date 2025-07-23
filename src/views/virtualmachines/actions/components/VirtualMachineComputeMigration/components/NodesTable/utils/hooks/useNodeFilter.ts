import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { NodeData } from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/types';

type UseNodeFilter = () => RowFilter<NodeData>[];

const useNodeFilter: UseNodeFilter = () => [
  {
    filter: (input, obj) => {
      const search = input.selected?.[0];

      if (!search) return true;

      return obj?.name?.toLowerCase().includes(search.toLowerCase());
    },
    filterGroupName: t('Node'),
    isMatch: () => true,
    items: [],
    type: 'node-name',
  },
];

export default useNodeFilter;
