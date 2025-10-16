import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetClusterNames } from '@stolostron/multicluster-sdk';
import { VirtualMachineRowFilterType } from '@virtualmachines/utils';

export const useClusterFilter = (): RowFilter<V1VirtualMachine> => {
  const [clusters] = useFleetClusterNames();

  return {
    filter: (input, obj) => {
      if (isEmpty(input.selected)) {
        return true;
      }

      return input.selected.some((cluster) => cluster === getCluster(obj));
    },
    filterGroupName: t('Cluster'),
    isMatch: () => true,
    items: clusters.map((cluster) => ({
      id: cluster,
      title: cluster,
    })),
    type: VirtualMachineRowFilterType.Cluster,
  };
};
