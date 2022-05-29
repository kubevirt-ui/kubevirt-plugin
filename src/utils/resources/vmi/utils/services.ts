import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';

export const getServicesForVmi = (
  services: IoK8sApiCoreV1Service[],
  vmi: V1VirtualMachineInstance,
): IoK8sApiCoreV1Service[] => {
  const vmiLabels = vmi?.metadata?.labels;

  if (!vmiLabels) return [];

  return (services || []).filter((service) => {
    const selectors = service?.spec?.selector || {};
    return (
      Object.keys(selectors).length > 0 &&
      Object.keys(selectors).every((key) => vmiLabels?.[key] === selectors?.[key])
    );
  });
};
