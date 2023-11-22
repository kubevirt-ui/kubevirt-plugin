import { BootMode } from './constants';

export type BootloaderLabel = { description: string; title: string; value: string };

export type BootloaderOptionValue = BootMode.bios | BootMode.uefi | BootMode.uefiSecure;
