import { type BootMode } from './constants';

export type BootloaderOption = { description: string; title: string; value: string };

export type BootloaderOptionValue =
  | BootMode.BIOS
  | BootMode.IPL
  | BootMode.UEFI
  | BootMode.UefiSecure;
