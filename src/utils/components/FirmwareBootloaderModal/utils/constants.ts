import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ARCHITECTURES } from '@kubevirt-utils/constants/constants';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getArchitecture } from '@kubevirt-utils/resources/vm/utils/selectors';

import { BootloaderOption } from './types';

export enum BootMode {
  bios = 'bios',
  ipl = 'ipl',
  uefi = 'uefi',
  uefiSecure = 'uefiSecure',
}

export const BootModeTitles = {
  [BootMode.bios]: t('BIOS'),
  [BootMode.ipl]: t('IPL'),
  [BootMode.uefi]: t('UEFI'),
  [BootMode.uefiSecure]: t('UEFI (secure)'),
};

const defaultBootloaderOptions: BootloaderOption[] = [
  {
    description: t('Use BIOS when bootloading the guest OS'),
    title: BootModeTitles[BootMode.bios],
    value: BootMode.bios,
  },
  {
    description: t('Use UEFI when bootloading the guest OS.'),
    title: BootModeTitles[BootMode.uefi],
    value: BootMode.uefi,
  },
  {
    description: t(
      'Use UEFI when bootloading the guest OS. Requires SMM feature, if the SMM feature is not set, choosing this method will set it to true',
    ),
    title: BootModeTitles[BootMode.uefiSecure],
    value: BootMode.uefiSecure,
  },
];

const s390xBootloaderOptions: BootloaderOption[] = [
  {
    description: t('Use IPL (Initial Program Load) when bootloading the guest OS'),
    title: BootModeTitles[BootMode.ipl],
    value: BootMode.ipl,
  },
];

export const getBootloaderOptions = (vm: V1VirtualMachine): BootloaderOption[] => {
  const architecture = getArchitecture(vm);

  if (architecture === ARCHITECTURES.S390X) {
    return s390xBootloaderOptions;
  }

  return defaultBootloaderOptions;
};
