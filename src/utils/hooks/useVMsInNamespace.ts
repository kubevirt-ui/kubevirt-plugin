import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { VirtualMachineModelGroupVersionKind } from '@kubevirt-utils/models';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

const useVMsInNamespace = (namespace?: string, cluster?: string) => {
  const clusterParam = useClusterParam();
  const [vms] = useK8sWatchData<V1VirtualMachine[]>({
    cluster: cluster || clusterParam,
    groupVersionKind: VirtualMachineModelGroupVersionKind,
    isList: true,
    namespace,
  });

  return vms;
};

export default useVMsInNamespace;
