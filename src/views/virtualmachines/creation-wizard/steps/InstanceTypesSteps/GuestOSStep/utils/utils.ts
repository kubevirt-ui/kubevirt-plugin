import { TFunction } from 'i18next';

import { OperatingSystemType } from '@virtualmachines/creation-wizard/steps/InstanceTypesSteps/GuestOSStep/utils/constants';

const rhel = require('../../../../assets/os-icons/rhel.svg') as string;
const windows = require('../../../../assets/os-icons/windows.svg') as string;
const otherLinux = require('../../../../assets/os-icons/linux.svg') as string;

export const getOperatingSystemsDetails = (t: TFunction) => {
  return {
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
  };
};

export const getOperatingSystemDetails = (operatingSystem: OperatingSystemType, t: TFunction) =>
  getOperatingSystemsDetails(t)[operatingSystem];
