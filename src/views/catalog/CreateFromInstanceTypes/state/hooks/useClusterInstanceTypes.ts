import { VirtualMachineClusterInstancetypeModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineClusterInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseClusterInstanceTypes = () => [
  instanceTypes: V1beta1VirtualMachineClusterInstancetype[],
  loaded: boolean,
  loadError: Error,
];

const useClusterInstanceTypes: UseClusterInstanceTypes = () => {
  const [instanceTypes, loaded, loadError] = useK8sWatchResource<
    V1beta1VirtualMachineClusterInstancetype[]
  >({
    groupVersionKind: VirtualMachineClusterInstancetypeModelGroupVersionKind,
    isList: true,
  });

  return [instanceTypes || [], loaded || !!loadError, loadError];
};

export default useClusterInstanceTypes;
