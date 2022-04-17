import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';

export const getServicesForVmi = (
  services: IoK8sApiCoreV1Service[],
  vmi: V1VirtualMachineInstance,
): IoK8sApiCoreV1Service[] => {
  const vmLabels = vmi?.metadata?.labels;
  return services?.filter((service) => {
    const selectors = service?.spec?.selector || {};
    return Object?.keys(selectors)?.every((key) => vmLabels?.[key] === selectors?.[key]);
  });
};
