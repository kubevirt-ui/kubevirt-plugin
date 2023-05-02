import produce from 'immer';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ensurePath, isEmpty } from '@kubevirt-utils/utils/utils';

import { BootMode, BootModeTitles } from './constants';
import { BootloaderOptionValue } from './types';

export const isObjectEmpty = (obj: object): boolean => obj && isEmpty(obj);

export const getBootloaderFromVM = (vm: V1VirtualMachine): BootloaderOptionValue => {
  const secureBoot = vm?.spec?.template?.spec?.domain?.firmware?.bootloader?.efi;

  if (secureBoot?.secureBoot === true || isObjectEmpty(secureBoot)) {
    return BootMode.uefiSecure;
  }
  if (secureBoot?.secureBoot === false) {
    return BootMode.uefi;
  }
  return BootMode.bios;
};

export const getBootloaderTitleFromVM = (vm: V1VirtualMachine): string => {
  const bootloader = getBootloaderFromVM(vm);

  return BootModeTitles[bootloader];
};

/**
 * A function to return the VirtualMachine object updated with a given boot mode
 * @param {V1VirtualMachine} vm - VirtualMachine object
 * @param {BootloaderOptionValue} firmwareBootloader - selected boot mode
 * @returns {V1VirtualMachine} updated VirtualMachine object
 */
export const updatedVMBootMode = (
  vm: V1VirtualMachine,
  firmwareBootloader: BootloaderOptionValue,
) =>
  produce<V1VirtualMachine>(vm as V1VirtualMachine, (vmDraft: V1VirtualMachine) => {
    ensurePath(vmDraft, 'spec.template.spec.domain.firmware.bootloader');
    ensurePath(vmDraft, 'spec.template.spec.domain.features.smm');
    vmDraft.spec.template.spec.domain.features.smm = { enabled: true };

    switch (firmwareBootloader) {
      case BootMode.uefi:
        vmDraft.spec.template.spec.domain.firmware.bootloader = {
          efi: { secureBoot: false },
        };
        break;
      case BootMode.uefiSecure:
        vmDraft.spec.template.spec.domain.firmware.bootloader = {
          efi: { secureBoot: true },
        };
        break;
      default:
        vmDraft.spec.template.spec.domain.firmware.bootloader = { bios: {} };
    }
  });
