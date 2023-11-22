import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';

import { BootloaderLabel } from './types';

export enum BootMode {
  bios = 'bios',
  uefi = 'uefi',
  uefiSecure = 'uefiSecure',
}

export const BootModeTitles = {
  [BootMode.bios]: t('BIOS'),
  [BootMode.uefi]: t('UEFI'),
  [BootMode.uefiSecure]: t('UEFI (secure)'),
};

export const bootloaderOptions: BootloaderLabel[] = [
  {
    description: t('Use BIOS when bootloading the guest OS (Default)'),
    title: BootModeTitles[BootMode.bios],
    value: BootMode.bios,
  },
  {
    description: t(
      'Use UEFI when bootloading the guest OS. Requires SMM feature, if the SMM feature is not set, choosing this method will set it to true',
    ),
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
