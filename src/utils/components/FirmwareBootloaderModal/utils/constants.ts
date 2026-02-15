import { BootloaderOption } from './types';

export enum BootMode {
  bios = 'bios',
  ipl = 'ipl',
  uefi = 'uefi',
  uefiSecure = 'uefiSecure',
}

export const BootModeTitles = {
  [BootMode.bios]: 'BIOS',
  [BootMode.ipl]: 'IPL',
  [BootMode.uefi]: 'UEFI',
  [BootMode.uefiSecure]: 'UEFI (secure)',
};

export const defaultBootloaderOptions: BootloaderOption[] = [
  {
    description: 'Use BIOS when bootloading the guest OS',
    title: BootModeTitles[BootMode.bios],
    value: BootMode.bios,
  },
  {
    description: 'Use UEFI when bootloading the guest OS.',
    title: BootModeTitles[BootMode.uefi],
    value: BootMode.uefi,
  },
  {
    description:
      'Use UEFI when bootloading the guest OS. Requires SMM feature, if the SMM feature is not set, choosing this method will set it to true',
    title: BootModeTitles[BootMode.uefiSecure],
    value: BootMode.uefiSecure,
  },
];

export const s390xBootloaderOptions: BootloaderOption[] = [
  {
    description: 'Use IPL (Initial Program Load) when bootloading the guest OS',
    title: BootModeTitles[BootMode.ipl],
    value: BootMode.ipl,
  },
];
