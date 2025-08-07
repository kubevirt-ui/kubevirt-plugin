import { InstallState } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import {
  installFailed,
  isInstalled,
  isInstalling,
  isNotInstalled,
} from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';

export const getHighAvailabilityInstallState = (
  nhcInstallState: InstallState,
  farInstallState: InstallState,
) => {
  if (isInstalled(nhcInstallState) && isInstalled(farInstallState)) return InstallState.INSTALLED;

  if (isInstalling(nhcInstallState) || isInstalling(farInstallState))
    return InstallState.INSTALLING;

  if (installFailed(nhcInstallState) || installFailed(farInstallState)) return InstallState.FAILED;

  if (isNotInstalled(nhcInstallState) || isNotInstalled(farInstallState))
    return InstallState.NOT_INSTALLED;
};
