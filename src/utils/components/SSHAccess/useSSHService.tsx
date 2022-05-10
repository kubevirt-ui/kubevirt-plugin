import { ServiceModel } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getServicesForVmi } from '@kubevirt-utils/resources/vmi';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { SSH_PORT } from './constants';

export type UseSSHServiceReturnType = [service: IoK8sApiCoreV1Service, loaded: boolean];

const useSSHService = (vmi: V1VirtualMachineInstance): UseSSHServiceReturnType => {
  const [services, servicesLoaded, servicesError] = useK8sWatchResource<IoK8sApiCoreV1Service[]>({
    kind: ServiceModel.kind,
    isList: true,
    namespace: vmi?.metadata?.namespace,
  });

  const vmiServices = getServicesForVmi(services, vmi);

  const sshVMIService = vmiServices.find((service) =>
    service?.spec?.ports?.find((port) => parseInt(port.targetPort, 10) === SSH_PORT),
  );

  return [sshVMIService, servicesLoaded || servicesError];
};

export default useSSHService;
