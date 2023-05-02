import { BootMode } from './constants';

export type BootloaderLabel = { value: string; title: string; description: string };

export type BootloaderOptionValue = BootMode.uefi | BootMode.uefiSecure | BootMode.bios;
