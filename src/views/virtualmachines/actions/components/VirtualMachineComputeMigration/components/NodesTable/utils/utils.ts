import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { sortByDirection, universalComparator } from '@kubevirt-utils/utils/utils';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { SortByDirection } from '@patternfly/react-table';
import { NodeData } from '@virtualmachines/actions/components/VirtualMachineComputeMigration/utils/types';

export const filters: RowFilter[] = [
  {
    filter: (input, obj) => {
      const search = input.selected?.[0];

      if (!search) return true;

      return obj?.nodeName?.toLowerCase().includes(search.toLowerCase());
    },
    filterGroupName: t('Node'),
    items: [],
    reducer: (obj) => obj?.drive,
    type: 'node-name',
  },
];

export const sortNodeColumn = (data: NodeData[], sortDirection: SortByDirection, field: string) =>
  data.sort((a, b) => sortByDirection(universalComparator, sortDirection)(a?.[field], b?.[field]));
