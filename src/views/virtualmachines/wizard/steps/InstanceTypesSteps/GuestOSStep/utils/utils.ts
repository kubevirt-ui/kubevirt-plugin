import { type TFunction } from 'i18next';

import otherLinux from '@virtualmachines/wizard/assets/os-icons/linux.svg';
import rhel from '@virtualmachines/wizard/assets/os-icons/rhel.svg';
import windows from '@virtualmachines/wizard/assets/os-icons/windows.svg';
import { OperatingSystemType } from '@virtualmachines/wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';

type OperatingSystemDetails = {
  icon: string;
  label: string;
};

export const getOperatingSystemsDetails = (
  t: TFunction,
): Record<OperatingSystemType, OperatingSystemDetails> => ({
  [OperatingSystemType.OTHER_LINUX]: {
    icon: otherLinux,
    label: t('Other Linux'),
  },
  [OperatingSystemType.RHEL]: {
    icon: rhel,
    label: t('RHEL'),
  },
  [OperatingSystemType.WINDOWS]: {
    icon: windows,
    label: t('Microsoft Windows'),
  },
});

export const getOperatingSystemDetails = (
  operatingSystem: OperatingSystemType,
  t: TFunction,
): OperatingSystemDetails => getOperatingSystemsDetails(t)[operatingSystem];
