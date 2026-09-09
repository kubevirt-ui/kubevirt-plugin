import { type TFunction } from 'i18next';
import { produce } from 'immer';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
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
import { type BootloaderOption, type BootloaderOptionValue } from './types';

export const isObjectEmpty = (obj: object): boolean => obj && isEmpty(obj);

export const getClusterOnlyArchitecture = (
  clusterWorkloadArchitectures?: string[],
): string | undefined => {
  return clusterWorkloadArchitectures?.length === 1 ? clusterWorkloadArchitectures[0] : undefined;
};

export const getBootloaderFromVM = (
  vm: V1VirtualMachine,
  defaultBootmode = BootMode.BIOS,
  clusterOnlyArchitecture?: string,
): BootloaderOptionValue => {
  const architecture = getArchitecture(vm) || clusterOnlyArchitecture;
  if (architecture === ARCHITECTURES.S390X) {
    return BootMode.IPL;
  }

  const uefiBoot = getBootloader(vm)?.efi;

  if (uefiBoot?.secureBoot === true || isObjectEmpty(uefiBoot)) {
    return BootMode.UefiSecure;
  }
  if (uefiBoot?.secureBoot === false) {
    return BootMode.UEFI;
  }

  if (getBootloader(vm)?.bios) return BootMode.BIOS;

  return defaultBootmode;
};

export const getBootloaderTitleFromVM = (
  vm: V1VirtualMachine,
  t: TFunction,
  defaultBootmode?: BootMode,
  clusterOnlyArchitecture?: string,
): string => {
  const bootloader = getBootloaderFromVM(vm, defaultBootmode, clusterOnlyArchitecture);
  return t(BootModeTitles[bootloader]);
};

export const getBootloaderOptions = (
  vm: V1VirtualMachine,
  clusterOnlyArchitecture?: string,
): BootloaderOption[] => {
  const architecture = getArchitecture(vm) || clusterOnlyArchitecture;

  if (architecture === ARCHITECTURES.S390X) {
    return s390xBootloaderOptions;
  }

  return defaultBootloaderOptions;
};

/**
 * A function to return the VirtualMachine object updated with a given boot mode
 * @param {V1VirtualMachine} vm - VirtualMachine object
 * @param {BootloaderOptionValue} firmwareBootloader - selected boot mode
 * @param clusterOnlyArchitecture
 * @returns {V1VirtualMachine} updated VirtualMachine object
 */
export const updatedVMBootMode = (
  vm: V1VirtualMachine,
  firmwareBootloader: BootloaderOptionValue,
  clusterOnlyArchitecture?: string,
): V1VirtualMachine =>
  produce<V1VirtualMachine>(vm as V1VirtualMachine, (vmDraft: V1VirtualMachine) => {
    const architecture = getArchitecture(vm) || clusterOnlyArchitecture;
    if (architecture === ARCHITECTURES.S390X && firmwareBootloader === BootMode.IPL) {
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
      case BootMode.UEFI:
        vmDraft.spec.template.spec.domain.firmware.bootloader = {
          efi: { secureBoot: false },
        };
        break;
      case BootMode.UefiSecure:
        vmDraft.spec.template.spec.domain.firmware.bootloader = {
          efi: { secureBoot: true },
        };
        break;
      default:
        vmDraft.spec.template.spec.domain.firmware.bootloader = { bios: {} };
    }
  });
