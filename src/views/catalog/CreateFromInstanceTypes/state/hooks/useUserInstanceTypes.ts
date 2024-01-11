import { VirtualMachineInstancetypeModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1VirtualMachineInstancetype } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseUserInstanceTypes = () => [
  instanceTypes: V1beta1VirtualMachineInstancetype[],
  loaded: boolean,
  loadError: Error,
];

const useUserInstanceTypes: UseUserInstanceTypes = () => {
  const [instanceTypes, loaded, loadError] = useK8sWatchResource<
    V1beta1VirtualMachineInstancetype[]
  >({
    groupVersionKind: VirtualMachineInstancetypeModelGroupVersionKind,
    isList: true,
  });

  return [instanceTypes || [], loaded || !!loadError, loadError];
};

export default useUserInstanceTypes;
