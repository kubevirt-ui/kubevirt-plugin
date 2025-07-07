import { ElementType } from 'react';

import { InstallState } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import InstalledIcon from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesList/components/icons/InstalledIcon';

import NotInstalledIcon from '../components/icons/NotInstalledIcon';

export const getInstallStateIcon = (installState: InstallState): ElementType => {
  if (installState === InstallState.INSTALLED) return InstalledIcon;
  return NotInstalledIcon;
};
