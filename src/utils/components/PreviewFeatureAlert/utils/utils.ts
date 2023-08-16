import { buildNSPath } from '@kubevirt-utils/hooks/useLastNamespacePath';

export const getOverviewSettingsPath = (namespace: string) => {
  const ns = buildNSPath(namespace);
  return `/k8s/${ns}/virtualization-overview/settings`;
};
