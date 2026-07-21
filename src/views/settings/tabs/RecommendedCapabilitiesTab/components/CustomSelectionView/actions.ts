import { type TFunction } from 'i18next';

import { type ActionDropdownItemType } from '@kubevirt-utils/components/ActionsDropdown/constants';

import { type CapabilityFeature, CapabilityInstallState } from '../../utils/types';

export const getCapabilityRowActions = (
  feature: CapabilityFeature,
  installState: CapabilityInstallState,
  isAdmin: boolean,
  notAdminTooltip: string,
  t: TFunction,
): ActionDropdownItemType[] => {
  if (installState === CapabilityInstallState.NotInstalled) {
    return [
      {
        cta: () => undefined,
        disabled: !isAdmin,
        disabledTooltip: isAdmin ? undefined : notAdminTooltip,
        id: `install-all-${feature.id}`,
        label: t('Install all operators'),
      },
    ];
  }

  if (installState === CapabilityInstallState.PartiallyInstalled) {
    return [
      {
        cta: () => undefined,
        disabled: !isAdmin,
        disabledTooltip: isAdmin ? undefined : notAdminTooltip,
        id: `install-missing-${feature.id}`,
        label: t('Install missing operators'),
      },
    ];
  }

  return [];
};
