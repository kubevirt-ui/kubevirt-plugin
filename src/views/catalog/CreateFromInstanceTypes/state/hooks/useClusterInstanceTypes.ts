import { VirtualMachineClusterInstancetypeModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useListClusters from '@kubevirt-utils/hooks/useListClusters';
import { Selector } from '@openshift-console/dynamic-plugin-sdk';

type UseClusterInstanceTypes = (
  fieldSelector?: string,
  selector?: Selector,
) => [instanceTypes: V1beta1VirtualMachineClusterInstancetype[], loaded: boolean, loadError: Error];

const useClusterInstanceTypes: UseClusterInstanceTypes = (fieldSelector, selector) => {
  const clusters = useListClusters();
  const [instanceTypes, loaded, loadError] = useKubevirtWatchResource<
    V1beta1VirtualMachineClusterInstancetype[]
  >(
    {
      fieldSelector,
      groupVersionKind: VirtualMachineClusterInstancetypeModelGroupVersionKind,
      isList: true,
      selector,
    },
    null,
    [{ property: 'cluster', values: clusters }],
  );

  return [instanceTypes || [], loaded || !!loadError, loadError];
};

export default useClusterInstanceTypes;
