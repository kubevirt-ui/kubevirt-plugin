import { VirtualMachineInstanceModelGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseVMI = (
  vmName: string,
  vmNamespace: string,
) => {
  vmi: V1VirtualMachineInstance;
  vmiLoaded: boolean;
  vmiLoadError: Error;
};

const useVMI: UseVMI = (vmName, vmNamespace) => {
  const [vmi, vmiLoaded, vmiLoadError] = useK8sWatchResource<V1VirtualMachineInstance>({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    isList: false,
    name: vmName,
    namespace: vmNamespace,
  });

  return {
    vmi,
    vmiLoaded,
    vmiLoadError,
  };
};

export default useVMI;
