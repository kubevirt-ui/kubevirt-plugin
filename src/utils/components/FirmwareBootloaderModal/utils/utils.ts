import { TFunction } from 'i18next';

import { V1Bootloader, V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { BootloaderOptionValue, bootloaderOptionValues } from './constants';

export const isUEFI = (vm: V1VirtualMachine): boolean =>
  !!vm?.spec?.template?.spec?.domain?.firmware?.bootloader?.efi;

export const isUEFISecure = (vm: V1VirtualMachine): boolean =>
  !!vm?.spec?.template?.spec?.domain?.firmware?.bootloader?.efi?.secureBoot;

export const getBootloaderFromVM = (vm: V1VirtualMachine): BootloaderOptionValue => {
  if (isUEFI(vm)) {
    return isUEFISecure(vm) ? bootloaderOptionValues.uefiSecure : bootloaderOptionValues.uefi;
  }
  return bootloaderOptionValues.bios;
};

export const getBootloaderLabelFromVM = (vm: V1VirtualMachine, t: TFunction): string => {
  if (isUEFI(vm)) {
    return isUEFISecure(vm) ? t('UEFI (secure)') : t('UEFI');
  }
  return t('BIOS');
};

export const getBIOSBootloader = (): V1Bootloader => ({
  bios: {},
});

export const getUEFIBootloader = (secure: boolean): V1Bootloader => ({
  efi: {
    secureBoot: secure,
  },
});
