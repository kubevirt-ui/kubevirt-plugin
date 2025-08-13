import { produce } from 'immer';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ARCHITECTURES } from '@kubevirt-utils/constants/constants';
import {
  getArchitecture,
  getBootloader,
  getDomainFeatures,
} from '@kubevirt-utils/resources/vm/utils/selectors';
import { ensurePath, isEmpty } from '@kubevirt-utils/utils/utils';

import {
  BootMode,
  BootModeTitles,
  defaultBootloaderOptions,
  s390xBootloaderOptions,
} from './constants';
import { BootloaderOption, BootloaderOptionValue } from './types';

export const isObjectEmpty = (obj: object): boolean => obj && isEmpty(obj);

export const getBootloaderFromVM = (
  vm: V1VirtualMachine,
  defaultBootmode = BootMode.bios,
): BootloaderOptionValue => {
  if (getArchitecture(vm) === ARCHITECTURES.S390X) {
    return BootMode.ipl;
  }

  const uefiBoot = getBootloader(vm)?.efi;

  if (uefiBoot?.secureBoot === true || isObjectEmpty(uefiBoot)) {
    return BootMode.uefiSecure;
  }
  if (uefiBoot?.secureBoot === false) {
    return BootMode.uefi;
  }

  if (getBootloader(vm)?.bios) return BootMode.bios;

  return defaultBootmode;
};

export const getBootloaderTitleFromVM = (
  vm: V1VirtualMachine,
  defaultBootmode?: BootMode,
): string => {
  const bootloader = getBootloaderFromVM(vm, defaultBootmode);

  return BootModeTitles[bootloader];
};

export const getBootloaderOptions = (vm: V1VirtualMachine): BootloaderOption[] => {
  const architecture = getArchitecture(vm);

  if (architecture === ARCHITECTURES.S390X) {
    return s390xBootloaderOptions;
  }

  return defaultBootloaderOptions;
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
    if (getArchitecture(vm) === ARCHITECTURES.S390X && firmwareBootloader === BootMode.ipl) {
      if (getBootloader(vmDraft)) {
        delete vmDraft.spec.template.spec.domain.firmware.bootloader;
      }

      if (getDomainFeatures(vmDraft)?.smm) {
        delete vmDraft.spec.template.spec.domain.features.smm;
      }
      return;
    }

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
