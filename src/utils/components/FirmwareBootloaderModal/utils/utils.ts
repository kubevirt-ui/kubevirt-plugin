import { TFunction } from 'i18next';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

import { BootloaderOptionValue } from './constants';

export const getBootloaderFromVM = (vm: V1VirtualMachine): BootloaderOptionValue => {
  if (!!vm?.spec?.template?.spec?.domain?.firmware?.bootloader?.efi?.secureBoot) {
    return 'uefiSecure';
  }
  if (!!vm?.spec?.template?.spec?.domain?.firmware?.bootloader?.efi) {
    return `uefi`;
  }
  return 'bios';
};

export const getBootloaderTitleFromVM = (vm: V1VirtualMachine, t: TFunction): string => {
  const bootloader = getBootloaderFromVM(vm);
  const titles = {
    uefiSecure: t('UEFI (secure)'),
    uefi: t('UEFI '),
    bios: t('BIOS'),
  };

  return titles[bootloader];
};
