import { type TFunction } from 'i18next';

import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';

import { type CapabilityFeature, CapabilityInstallState } from '../../utils/types';

export const getCapabilityRowActions = (
  feature: CapabilityFeature,
  installState: CapabilityInstallState,
  isAdmin: boolean,
  isFeatureInstalling: boolean,
  installFeature: (feature: CapabilityFeature) => Promise<void>,
  notAdminTooltip: string,
  t: TFunction,
): ActionDropdownItemType[] => {
  const isDisabled = !isAdmin || isFeatureInstalling;
  const disabledTooltip = !isAdmin ? notAdminTooltip : undefined;

  if (installState === CapabilityInstallState.NotInstalled) {
    return [
      {
        cta: () => void installFeature(feature),
        disabled: isDisabled,
        disabledTooltip,
        id: `install-all-${feature.id}`,
        label: t('Install all operators'),
      },
    ];
  }

  if (installState === CapabilityInstallState.PartiallyInstalled) {
    return [
      {
        cta: () => void installFeature(feature),
        disabled: isDisabled,
        disabledTooltip,
        id: `install-missing-${feature.id}`,
        label: t('Install missing operators'),
      },
    ];
  }

  return [];
};
