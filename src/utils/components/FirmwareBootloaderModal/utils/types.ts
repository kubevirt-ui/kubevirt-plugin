import { BootMode } from './constants';

export type BootloaderOption = { description: string; title: string; value: string };

export type BootloaderOptionValue =
  | BootMode.bios
  | BootMode.ipl
  | BootMode.uefi
  | BootMode.uefiSecure;
