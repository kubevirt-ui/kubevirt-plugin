import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { InstallState } from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/utils/types';
import FailedInstallIcon from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/icons/FailedInstallIcon';
import InstalledIcon from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/icons/InstalledIcon';
import NotInstalledIcon from '@overview/SettingsTab/ClusterTab/components/VirtualizationFeaturesSection/VirtualizationFeaturesWizard/components/SummaryStep/components/icons/NotInstalledIcon';
import { InProgressIcon } from '@patternfly/react-icons';

export const installStateIconAndMessage = {
  [InstallState.FAILED]: { Icon: FailedInstallIcon, message: t('Failed') },
  [InstallState.INSTALLED]: { Icon: InstalledIcon, message: t('Installed') },
  [InstallState.INSTALLING]: { Icon: InProgressIcon, message: '' },
  [InstallState.NOT_INSTALLED]: { Icon: NotInstalledIcon, message: t('Not configured') },
};
