import { type TFunction } from 'i18next';

import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';

import { type CapabilityFeature, CapabilityInstallState } from '../../utils/types';

export const getCapabilityRowActions = (
  feature: CapabilityFeature,
  installState: CapabilityInstallState,
  isFeatureInstalling: boolean,
  installFeature: (feature: CapabilityFeature) => Promise<void>,
  t: TFunction,
): ActionDropdownItemType[] => {
  if (installState === CapabilityInstallState.NotInstalled) {
    return [
      {
        cta: () => void installFeature(feature),
        disabled: isFeatureInstalling,
        id: `install-all-${feature.id}`,
        label: t('Install all operators'),
      },
    ];
  }

  if (installState === CapabilityInstallState.PartiallyInstalled) {
    return [
      {
        cta: () => void installFeature(feature),
        disabled: isFeatureInstalling,
        id: `install-missing-${feature.id}`,
        label: t('Install missing operators'),
      },
    ];
  }

  return [];
};
