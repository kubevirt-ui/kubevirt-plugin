import { modelToGroupVersionKind, ServiceModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { useVMIAndPodsForVM } from '@kubevirt-utils/resources/vm';
import { getServicesForVmi } from '@kubevirt-utils/resources/vmi';
import { getVMIPod } from '@kubevirt-utils/resources/vmi/utils/pod';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import { SSH_PORT } from './constants';

export type UseSSHServiceReturnType = [service: IoK8sApiCoreV1Service, loaded: boolean];

const useSSHService = (vm: V1VirtualMachine): UseSSHServiceReturnType => {
  const watchServiceResources = {
    cluster: getCluster(vm),
    groupVersionKind: modelToGroupVersionKind(ServiceModel),
    isList: true,
    namespace: vm?.metadata?.namespace,
  };

  const [services, servicesLoaded, servicesError] = useK8sWatchData<IoK8sApiCoreV1Service[]>(
    vm && watchServiceResources,
  );

  const { pods, vmi } = useVMIAndPodsForVM(
    vm ? getName(vm) : '',
    vm ? getNamespace(vm) : '',
    vm ? getCluster(vm) : undefined,
  );

  if (!vm) return [undefined, false];

  const pod = getVMIPod(vmi, pods);
  const vmiServices = getServicesForVmi(services, pod, vm, vmi);

  const sshVMIService = vmiServices.find((service) =>
    service?.spec?.ports?.find((port) => parseInt(port.targetPort, 10) === SSH_PORT),
  );

  return [sshVMIService, servicesLoaded || servicesError];
};

export default useSSHService;
