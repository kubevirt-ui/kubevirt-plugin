import {
  modelToGroupVersionKind,
  PodModel,
  VirtualMachineInstanceModelGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseVMIAndPodsForVMValues = {
  error: any;
  loaded: boolean;
  pods: K8sResourceCommon[];
  vmi: V1VirtualMachineInstance;
};

export const useVMIAndPodsForVM = (
  vmName: string,
  vmNamespace: string,
): UseVMIAndPodsForVMValues => {
  const [vmi, vmiLoaded, vmiLoadError] = useK8sWatchResource<V1VirtualMachineInstance>({
    groupVersionKind: VirtualMachineInstanceModelGroupVersionKind,
    isList: false,
    name: vmName,
    namespace: vmNamespace,
  });

  const [pods, podsLoaded, podsLoadError] = useK8sWatchResource<K8sResourceCommon[]>({
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
