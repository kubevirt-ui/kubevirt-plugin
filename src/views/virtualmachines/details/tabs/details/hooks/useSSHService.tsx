import { ServiceModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

const useSSHService = (vmi: V1VirtualMachineInstance) => {
  return useK8sWatchResource<IoK8sApiCoreV1Service>({
    kind: ServiceModel.kind,
    isList: false,
    namespace: vmi?.metadata?.namespace,
    name: `${vmi?.metadata?.name}-ssh-service`,
  });
};

export default useSSHService;
