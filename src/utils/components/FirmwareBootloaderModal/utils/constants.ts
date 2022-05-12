export type BootloaderLabel = { value: string; title: string; description: string };

export type BootloaderOptionValue = 'bios' | 'uefi' | 'uefiSecure';

export const bootloaderOptionValues: { [key: string]: BootloaderOptionValue } = {
  bios: 'bios',
  uefi: 'uefi',
  uefiSecure: 'uefiSecure',
};
