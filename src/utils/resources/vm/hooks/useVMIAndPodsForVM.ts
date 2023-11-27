import { modelToGroupVersionKind, PodModel } from '@kubevirt-ui/kubevirt-api/console';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import useVMI from '@kubevirt-utils/resources/vm/hooks/useVMI';
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
  const { vmi, vmiLoaded, vmiLoadError } = useVMI(vmName, vmNamespace);

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
