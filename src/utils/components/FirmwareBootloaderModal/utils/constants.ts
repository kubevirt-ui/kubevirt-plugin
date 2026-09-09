import { type BootloaderOption } from './types';

export enum BootMode {
  Bios = 'bios',
  Ipl = 'ipl',
  Uefi = 'uefi',
  UefiSecure = 'uefiSecure',
}

export const BootModeTitles = {
  [BootMode.Bios]: 'BIOS',
  [BootMode.Ipl]: 'IPL',
  [BootMode.Uefi]: 'UEFI',
  [BootMode.UefiSecure]: 'UEFI (secure)',
};

export const defaultBootloaderOptions: BootloaderOption[] = [
  {
    description: 'Use BIOS when bootloading the guest OS',
    title: BootModeTitles[BootMode.Bios],
    value: BootMode.Bios,
  },
  {
    description: 'Use UEFI when bootloading the guest OS.',
    title: BootModeTitles[BootMode.Uefi],
    value: BootMode.Uefi,
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
    title: BootModeTitles[BootMode.Ipl],
    value: BootMode.Ipl,
  },
];
