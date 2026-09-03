import { modelToGroupVersionKind, PodModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiCoreV1Pod } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import useVMI from '@kubevirt-utils/resources/vm/hooks/useVMI';
import { getVMIPod } from '@kubevirt-utils/resources/vmi/utils/pod';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

type UseVMIAndPodsForVMValues = {
  error: Error | undefined;
  loaded: boolean;
  pod: IoK8sApiCoreV1Pod | null | undefined;
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
  const filteredVmi =
    vmName === getName(vmi) && vmNamespace === getNamespace(vmi) ? vmi : undefined;

  return {
    error,
    loaded,
    pod: getVMIPod(filteredVmi, pods),
    vmi: filteredVmi,
  };
};
