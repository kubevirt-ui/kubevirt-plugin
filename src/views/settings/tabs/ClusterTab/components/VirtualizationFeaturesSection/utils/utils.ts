import { InstallState } from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import InstalledIconWithTooltip from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/components/icons/InstalledIconWithTooltip';
import NotInstalledIconWithTooltip from '@settings/tabs/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/components/icons/NotInstalledIconWithTooltip';

export const isInstalled = (installState: InstallState): boolean =>
  installState === InstallState.INSTALLED;
export const isNotInstalled = (installState: InstallState): boolean =>
  installState === InstallState.NOT_INSTALLED;
export const installFailed = (installState: InstallState): boolean =>
  installState === InstallState.FAILED;
export const isInstalling = (installState: InstallState): boolean =>
  installState === InstallState.INSTALLING;

export const getInstallStateIcon = (installState: InstallState) => {
  if (installState === InstallState.INSTALLED) return InstalledIconWithTooltip;
  return NotInstalledIconWithTooltip;
};
