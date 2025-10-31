import { VirtualMachineClusterInstancetypeModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useListMulticlusterFilters from '@kubevirt-utils/hooks/useListMulticlusterFilters';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { Selector } from '@openshift-console/dynamic-plugin-sdk';

type UseClusterInstanceTypes = (
  fieldSelector?: string,
  selector?: Selector,
  cluster?: string,
) => [instanceTypes: V1beta1VirtualMachineClusterInstancetype[], loaded: boolean, loadError: Error];

const useClusterInstanceTypes: UseClusterInstanceTypes = (fieldSelector, selector, cluster) => {
  const multiclusterFilters = useListMulticlusterFilters();
  const clusterParam = useClusterParam();

  const [instanceTypes, loaded, loadError] = useKubevirtWatchResource<
    V1beta1VirtualMachineClusterInstancetype[]
  >(
    {
      cluster: cluster || clusterParam,
      fieldSelector,
      groupVersionKind: VirtualMachineClusterInstancetypeModelGroupVersionKind,
      isList: true,
      selector,
    },
    null,
    multiclusterFilters,
  );

  return [instanceTypes || [], loaded || !!loadError, loadError];
};

export default useClusterInstanceTypes;
