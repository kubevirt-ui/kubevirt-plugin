import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { BootloaderLabel } from './types';

export enum BootMode {
  uefi = 'uefi',
  uefiSecure = 'uefiSecure',
  bios = 'bios',
}

export const BootModeTitles = {
  [BootMode.uefiSecure]: t('UEFI (secure)'),
  [BootMode.uefi]: t('UEFI'),
  [BootMode.bios]: t('BIOS'),
};

export const bootloaderOptions: BootloaderLabel[] = [
  {
    value: BootMode.bios,
    title: BootModeTitles[BootMode.bios],
    description: t('Use BIOS when bootloading the guest OS (Default)'),
  },
  {
    value: BootMode.uefi,
    title: BootModeTitles[BootMode.uefi],
    description: t(
      'Use UEFI when bootloading the guest OS. Requires SMM feature, if the SMM feature is not set, choosing this method will set it to true',
    ),
  },
  {
    value: BootMode.uefiSecure,
    title: BootModeTitles[BootMode.uefiSecure],
    description: t(
      'Use UEFI when bootloading the guest OS. Requires SMM feature, if the SMM feature is not set, choosing this method will set it to true',
    ),
  },
];
