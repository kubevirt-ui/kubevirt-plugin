import { InstallState } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/types';

export const isInstalled = (installState: InstallState): boolean =>
  installState === InstallState.INSTALLED;
export const isNotInstalled = (installState: InstallState): boolean =>
  installState === InstallState.NOT_INSTALLED;
export const installFailed = (installState: InstallState): boolean =>
  installState === InstallState.FAILED;
export const isInstalling = (installState: InstallState): boolean =>
  installState === InstallState.INSTALLING;
