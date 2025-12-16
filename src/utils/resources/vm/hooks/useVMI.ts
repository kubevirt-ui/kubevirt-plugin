import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

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
  const [vmi, vmiLoaded, vmiLoadError] = useK8sWatchData<V1VirtualMachineInstance>(
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
