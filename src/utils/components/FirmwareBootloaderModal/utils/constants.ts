import { type BootloaderOption } from './types';

export enum BootMode {
  BIOS = 'bios',
  IPL = 'ipl',
  UEFI = 'uefi',
  UefiSecure = 'uefiSecure',
}

export const BootModeTitles = {
  [BootMode.BIOS]: 'BIOS',
  [BootMode.IPL]: 'IPL',
  [BootMode.UEFI]: 'UEFI',
  [BootMode.UefiSecure]: 'UEFI (secure)',
};

export const defaultBootloaderOptions: BootloaderOption[] = [
  {
    description: 'Use BIOS when bootloading the guest OS',
    title: BootModeTitles[BootMode.BIOS],
    value: BootMode.BIOS,
  },
  {
    description: 'Use UEFI when bootloading the guest OS.',
    title: BootModeTitles[BootMode.UEFI],
    value: BootMode.UEFI,
  },
  {
    description:
      'Use UEFI when bootloading the guest OS. Requires SMM feature, if the SMM feature is not set, choosing this method will set it to true',
    title: BootModeTitles[BootMode.UefiSecure],
    value: BootMode.UefiSecure,
  },
];

export const s390xBootloaderOptions: BootloaderOption[] = [
  {
    description: 'Use IPL (Initial Program Load) when bootloading the guest OS',
    title: BootModeTitles[BootMode.IPL],
    value: BootMode.IPL,
  },
];
