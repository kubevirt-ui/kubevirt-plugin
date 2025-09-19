import { TFunction } from 'react-i18next';

import { InstallState } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import FailedInstallIcon from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/icons/FailedInstallIcon';
import InstalledIcon from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/icons/InstalledIcon';
import NotInstalledIcon from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/icons/NotInstalledIcon';
import { InProgressIcon, UnknownIcon } from '@patternfly/react-icons';

export const installStateIcon = {
  [InstallState.FAILED]: FailedInstallIcon,
  [InstallState.INSTALLED]: InstalledIcon,
  [InstallState.INSTALLING]: InProgressIcon,
  [InstallState.NOT_INSTALLED]: NotInstalledIcon,
};

export const getInstallStateMessageMapper = (t: TFunction): { [key in InstallState]: string } => ({
  [InstallState.FAILED]: t('Failed'),
  [InstallState.INSTALLED]: t('Installed'),
  [InstallState.INSTALLING]: t('Installing'),
  [InstallState.NOT_INSTALLED]: t('Not configured'),
  [InstallState.UNKNOWN]: t('Unknown status'),
});

export const getInstallStateIcon = (installState: InstallState) =>
  installState ? installStateIcon[installState] : UnknownIcon;

export const getInstallStateMessage = (installState: InstallState, t: TFunction) => {
  const installStateMapper = getInstallStateMessageMapper(t);
  return installStateMapper[installState];
};
