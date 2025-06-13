import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useFleetK8sWatchResource } from '@stolostron/multicluster-sdk';

type UseVMI = (
  vmName: string,
  vmNamespace: string,
  vmCluster?: string,
  fetch?: boolean,
) => {
  vmi: V1VirtualMachineInstance;
  vmiLoaded: boolean;
  vmiLoadError: Error;
};

const useVMI: UseVMI = (vmName, vmNamespace, vmCluster, fetch = true) => {
  const [vmi, vmiLoaded, vmiLoadError] = useFleetK8sWatchResource<V1VirtualMachineInstance>(
    fetch && {
      cluster: vmCluster,
      groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
      isList: false,
      name: vmName,
      namespace: vmNamespace,
    },
  );

  return {
    vmi,
    vmiLoaded,
    vmiLoadError,
  };
};

export default useVMI;
