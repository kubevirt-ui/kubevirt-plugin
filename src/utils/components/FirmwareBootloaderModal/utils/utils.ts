import { TFunction } from 'i18next';

import { V1Bootloader, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

type BootloaderLabels = { bios: string; uefi: string; uefiSecure: string };

export const getBootloaderLabels = (t: TFunction): BootloaderLabels => ({
  bios: t('BIOS'),
  uefi: t('UEFI'),
  uefiSecure: t('UEFI (use secureBoot)'),
});

export const isUEFI = (vm: V1VirtualMachine): boolean =>
  !!vm?.spec?.template?.spec?.domain?.firmware?.bootloader?.efi;

export const isUEFISecure = (vm: V1VirtualMachine): boolean =>
  vm?.spec?.template?.spec?.domain?.firmware?.bootloader?.efi?.secureBoot;

export const isUEFISelected = (
  selectedFirmwareBootloader: string,
  bootloaderLabels: BootloaderLabels,
): boolean =>
  selectedFirmwareBootloader === bootloaderLabels.uefi ||
  selectedFirmwareBootloader === bootloaderLabels.uefiSecure;

export const isUEFISecureSelected = (
  selectedFirmwareBootloader: string,
  bootloaderLabels: BootloaderLabels,
): boolean => selectedFirmwareBootloader === bootloaderLabels.uefiSecure;

export const getBootloaderLabelFromVM = (
  vm: V1VirtualMachine,
  bootloaderLabels: BootloaderLabels,
): string => {
  if (isUEFI(vm)) {
    return isUEFISecure(vm) ? bootloaderLabels.uefiSecure : bootloaderLabels.uefi;
  }
  return bootloaderLabels.bios;
};

export const getBIOSBootloader = (): V1Bootloader => ({
  bios: {},
});

export const getUEFIBootloader = (secure: boolean): V1Bootloader => ({
  efi: {
    secureBoot: secure,
  },
});
