import { TFunction } from 'i18next';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { BootloaderOptionValue, bootloaderOptionValues } from './constants';

export const isUEFI = (vm: V1VirtualMachine): boolean =>
  !!vm?.spec?.template?.spec?.domain?.firmware?.bootloader?.efi;

export const isUEFISecure = (vm: V1VirtualMachine): boolean =>
  !!vm?.spec?.template?.spec?.domain?.firmware?.bootloader?.efi?.secureBoot;

export const getBootloaderFromVM = (vm: V1VirtualMachine): BootloaderOptionValue => {
  if (isUEFISecure(vm)) {
    return bootloaderOptionValues.uefiSecure;
  }
  if (isUEFI(vm)) {
    return bootloaderOptionValues.uefi;
  }
  return bootloaderOptionValues.bios;
};

export const getBootloaderLabelFromVM = (vm: V1VirtualMachine, t: TFunction): string => {
  if (isUEFISecure(vm)) {
    return t('UEFI (secure)');
  }
  if (isUEFI(vm)) {
    return t('UEFI');
  }
  return t('BIOS');
};
