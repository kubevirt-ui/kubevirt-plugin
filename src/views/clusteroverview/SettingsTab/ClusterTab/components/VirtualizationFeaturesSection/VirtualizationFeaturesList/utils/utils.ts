import { VirtFeatureOperatorItem } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/hooks/useVirtualizationOperators/utils/types';
import { InstallState } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/types';

export const getOperatorHubURL = (uid: string) => `/operatorhub/all-namespaces?details-item=${uid}`;

export const getInstallStatus = (operators: VirtFeatureOperatorItem[]): InstallState => {
  const isInstalled = operators?.some((operator) => operator?.installed);
  const isInstalling = operators?.some((operator) => operator?.isInstalling);

  if (isInstalled) return InstallState.INSTALLED;
  if (isInstalling) return InstallState.INSTALLING;

  return InstallState.NOT_INSTALLED;
};
