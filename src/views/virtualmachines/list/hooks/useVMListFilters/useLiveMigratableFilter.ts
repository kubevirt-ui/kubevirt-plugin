import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useSingleNodeCluster from '@kubevirt-utils/hooks/useSingleNodeCluster';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { isLiveMigratable } from '@virtualmachines/utils';

import { VirtualMachineRowFilterType } from '../../../utils/constants';

export const useLiveMigratableFilter = (): RowFilter<V1VirtualMachine> => {
  const [isSingleNodeCluster] = useSingleNodeCluster();

  return {
    filter: (selectedItems, obj) => {
      const isMigratable = isLiveMigratable(obj, isSingleNodeCluster);
      return (
        selectedItems?.selected?.length === 0 ||
        (selectedItems?.selected?.includes('migratable') && isMigratable) ||
        (selectedItems?.selected?.includes('notMigratable') && !isMigratable)
      );
    },
    filterGroupName: t('Live migratable'),
    items: [
      { id: 'migratable', title: t('Migratable') },
      { id: 'notMigratable', title: t('Not migratable') },
    ],
    reducer: (obj) => (isLiveMigratable(obj, isSingleNodeCluster) ? 'migratable' : 'notMigratable'),
    type: VirtualMachineRowFilterType.LiveMigratable,
  };
};
