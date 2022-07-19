import { IoK8sApiCoreV1Service } from '@kubevirt-ui/kubevirt-api/kubernetes/models';

export const getServicesForVmi = (
  services: IoK8sApiCoreV1Service[],
  vmiLabels: {
    [key: string]: string;
  },
): IoK8sApiCoreV1Service[] => {
  if (!vmiLabels) return [];

  return (services || []).filter((service) => {
    const selectors = service?.spec?.selector || {};
    return (
      Object.keys(selectors).length > 0 &&
      Object.keys(selectors).every((key) => vmiLabels?.[key] === selectors?.[key])
    );
  });
};
