import {
  modelToGroupVersionKind,
  PodModel,
  VirtualMachineInstanceModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseVMIAndPodsForVMValues = {
  vmi: V1VirtualMachineInstance;
  pods: K8sResourceCommon[];
  loaded: boolean;
  error: any;
};

const useVMIAndPodsForVM = (vmName: string, vmNamespace: string): UseVMIAndPodsForVMValues => {
  const [vmi, vmiLoaded, vmiLoadError] = useK8sWatchResource<V1VirtualMachineInstance>({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    name: vmName,
    namespace: vmNamespace,
    isList: false,
  });

  const [pods, podsLoaded, podsLoadError] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(PodModel),
    isList: true,
    namespace: vmNamespace,
  });

  const loaded = vmiLoaded && podsLoaded;
  const error = vmiLoadError || podsLoadError;

  return {
    vmi,
    pods,
    loaded,
    error,
  };
};

export default useVMIAndPodsForVM;
