import produce from 'immer';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { signal } from '@preact/signals-react';

import {
  ensureNestedStructure,
  isMutableObject,
  parsePath,
  setValueAtPath,
} from './customizeWizardVMSignalPathUtils';

export const customizeWizardVMSignal = signal<V1VirtualMachine | null>(null);

export const getCustomizeWizardVM = (): V1VirtualMachine | null => customizeWizardVMSignal.value;

export const mergeVMData = (currentData: unknown, updateData: unknown): unknown => {
  // Handle null/undefined cases
  if (currentData == null && updateData == null) {
    return {};
  }

  if (currentData == null) {
    return updateData;
  }

  if (updateData == null) {
    return currentData;
  }

  // Handle array merging
  if (Array.isArray(currentData) || Array.isArray(updateData)) {
    const currentArray = Array.isArray(currentData) ? currentData : [];
    const updateArray = Array.isArray(updateData) ? updateData : [];
    return currentArray.concat(updateArray);
  }

  // Handle object merging
  if (isMutableObject(currentData) && isMutableObject(updateData)) {
    return { ...currentData, ...updateData };
  }

  // For primitive values, return the updateData
  return updateData;
};

const applyVMUpdate = (
  currentVM: V1VirtualMachine,
  data: unknown,
  merge: boolean,
  path: string | string[],
): V1VirtualMachine => {
  const pathParts = parsePath(path);

  if (pathParts.length === 0) {
    return currentVM;
  }

  return produce(currentVM, (draft) => {
    ensureNestedStructure(draft, path, pathParts);
    setValueAtPath(draft, pathParts, data, merge, mergeVMData);
  });
};

type PatchCustomizeWizardVMReplace = {
  data: V1VirtualMachine;
  merge?: never;
  path?: undefined;
};

type PatchCustomizeWizardVMUpdate = {
  data: unknown;
  merge?: boolean;
  path: string | string[];
};

const isVMReplaceEntry = (
  entry: PatchCustomizeWizardVMReplace | PatchCustomizeWizardVMUpdate,
): entry is PatchCustomizeWizardVMReplace => entry.path === undefined;

export type PatchCustomizeWizardVMSignalArgs = (
  | PatchCustomizeWizardVMReplace
  | PatchCustomizeWizardVMUpdate
)[];

export type PatchCustomizeWizardVMSignal = (
  vmElementsToUpdate: PatchCustomizeWizardVMSignalArgs,
) => V1VirtualMachine | undefined;

export const patchCustomizeWizardVMSignal: PatchCustomizeWizardVMSignal = (vmElementsToUpdate) => {
  if (!customizeWizardVMSignal.value) {
    return undefined;
  }

  const initialVM = produce(customizeWizardVMSignal.value, (draft) => draft);

  const updatedVM = vmElementsToUpdate.reduce<V1VirtualMachine>((currentVM, entry) => {
    if (isVMReplaceEntry(entry)) {
      return entry.data;
    }
    if (entry.path === '') {
      return currentVM;
    }

    return applyVMUpdate(currentVM, entry.data, entry.merge ?? false, entry.path);
  }, initialVM);

  customizeWizardVMSignal.value = updatedVM;

  return updatedVM;
};

export const updateVMCustomizeIT = (vm: V1VirtualMachine): Promise<V1VirtualMachine | undefined> =>
  Promise.resolve(patchCustomizeWizardVMSignal([{ data: vm }]));

export const setCustomizeWizardVMSignal = (vm: V1VirtualMachine | null): void => {
  customizeWizardVMSignal.value = vm;
};
