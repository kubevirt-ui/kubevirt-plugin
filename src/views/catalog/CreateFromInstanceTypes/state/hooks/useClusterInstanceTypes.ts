import { VirtualMachineClusterInstancetypeModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { Selector, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseClusterInstanceTypes = (
  fieldSelector?: string,
  selector?: Selector,
) => [instanceTypes: V1beta1VirtualMachineClusterInstancetype[], loaded: boolean, loadError: Error];

const useClusterInstanceTypes: UseClusterInstanceTypes = (fieldSelector, selector) => {
  const [instanceTypes, loaded, loadError] = useK8sWatchResource<
    V1beta1VirtualMachineClusterInstancetype[]
  >({
    fieldSelector,
    groupVersionKind: VirtualMachineClusterInstancetypeModelGroupVersionKind,
    isList: true,
    selector,
  });

  return [instanceTypes || [], loaded || !!loadError, loadError];
};

export default useClusterInstanceTypes;
