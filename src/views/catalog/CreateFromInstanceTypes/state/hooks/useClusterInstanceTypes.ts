import { VirtualMachineClusterInstancetypeModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { Selector } from '@openshift-console/dynamic-plugin-sdk';

type UseClusterInstanceTypes = (
  fieldSelector?: string,
  selector?: Selector,
) => [instanceTypes: V1beta1VirtualMachineClusterInstancetype[], loaded: boolean, loadError: Error];

const useClusterInstanceTypes: UseClusterInstanceTypes = (fieldSelector, selector) => {
  const cluster = useClusterParam();
  const [instanceTypes, loaded, loadError] = useK8sWatchData<
    V1beta1VirtualMachineClusterInstancetype[]
  >({
    cluster,
    fieldSelector,
    groupVersionKind: VirtualMachineClusterInstancetypeModelGroupVersionKind,
    isList: true,
    selector,
  });

  return [instanceTypes || [], loaded || !!loadError, loadError];
};

export default useClusterInstanceTypes;
