import { modelToGroupVersionKind, PodModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Pod } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useVMI from '@kubevirt-utils/resources/vm/hooks/useVMI';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

type UseVMIAndPodsForVMValues = {
  error: any;
  loaded: boolean;
  pods: IoK8sApiCoreV1Pod[];
  vmi: V1VirtualMachineInstance;
};

export const useVMIAndPodsForVM = (
  vmName: string,
  vmNamespace: string,
  vmCluster?: string,
): UseVMIAndPodsForVMValues => {
  const { vmi, vmiLoaded, vmiLoadError } = useVMI(vmName, vmNamespace, vmCluster);

  const [pods, podsLoaded, podsLoadError] = useK8sWatchData<K8sResourceCommon[]>({
    cluster: vmCluster,
    groupVersionKind: modelToGroupVersionKind(PodModel),
    isList: true,
    namespace: vmNamespace,
  });

  const loaded = vmiLoaded && podsLoaded;
  const error = vmiLoadError || podsLoadError;

  return {
    error,
    loaded,
    pods,
    vmi: vmName === vmi?.metadata?.name && vmNamespace === vmi?.metadata?.namespace && vmi,
  };
};
