import { type BootMode } from './constants';

export type BootloaderOption = { description: string; title: string; value: string };

export type BootloaderOptionValue =
  | BootMode.Bios
  | BootMode.Ipl
  | BootMode.Uefi
  | BootMode.UefiSecure;
