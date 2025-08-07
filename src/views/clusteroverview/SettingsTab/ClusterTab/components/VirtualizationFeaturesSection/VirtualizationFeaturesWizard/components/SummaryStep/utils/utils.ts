import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { InstallState } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import { isNotInstalled } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/utils';
import FailedInstallIcon from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/icons/FailedInstallIcon';
import InstalledIcon from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/icons/InstalledIcon';
import NotInstalledIcon from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/icons/NotInstalledIcon';
import { InProgressIcon, UnknownIcon } from '@patternfly/react-icons';

export const installStateIconAndMessage = {
  [InstallState.FAILED]: { Icon: FailedInstallIcon, message: t('Failed') },
  [InstallState.INSTALLED]: { Icon: InstalledIcon, message: t('Installed') },
  [InstallState.INSTALLING]: { Icon: InProgressIcon, message: '' },
  [InstallState.NOT_INSTALLED]: { Icon: NotInstalledIcon, message: t('Not configured') },
};

export const installStateIcon = {
  [InstallState.FAILED]: FailedInstallIcon,
  [InstallState.INSTALLED]: InstalledIcon,
  [InstallState.INSTALLING]: InProgressIcon,
  [InstallState.NOT_INSTALLED]: NotInstalledIcon,
};

export const installStateMessage = {
  [InstallState.FAILED]: t('Failed'),
  [InstallState.INSTALLED]: t('Installed'),
  [InstallState.INSTALLING]: '',
  [InstallState.NOT_INSTALLED]: t('Not configured'),
};

export const getInstallStateIcon = (installState: InstallState, toBeInstalled: boolean) => {
  if (toBeInstalled && isNotInstalled(installState))
    return installStateIcon[InstallState.INSTALLING];

  return installState ? installStateIcon[installState] : UnknownIcon;
};

export const getInstallStateMessage = (installState: InstallState, toBeInstalled: boolean) => {
  if (toBeInstalled && isNotInstalled(installState))
    return installStateMessage[InstallState.INSTALLING];

  return installState ? installStateMessage[installState] : t('Unknown status');
};
