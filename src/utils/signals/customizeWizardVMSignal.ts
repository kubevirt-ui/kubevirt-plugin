import produce from 'immer';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { ensurePath } from '@kubevirt-utils/utils/utils';
import { signal } from '@preact/signals-react';

export const customizeWizardVMSignal = signal<V1VirtualMachine>(null);

export const getCustomizeWizardVM = (): V1VirtualMachine | null => customizeWizardVMSignal.value;

export const mergeVMData = (currentData: any, updateData: any) => {
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
    return [...currentArray, ...updateArray];
  }

  // Handle object merging
  if (typeof currentData === 'object' && typeof updateData === 'object') {
    return { ...currentData, ...updateData };
  }

  // For primitive values, return the updateData
  return updateData;
};

// ensurePath joins array segments with "." and re-splits, which breaks keys that
// contain dots (e.g. label "vm.openshift.io/folder") into nested objects.
const ensurePathParts = (obj: object, pathParts: string[]): void => {
  pathParts.slice(0, -1).reduce((current, part) => {
    if (!current[part]) {
      current[part] = {};
    }
    return current[part];
  }, obj);
};

const parsePath = (path: string | string[]): string[] =>
  (typeof path === 'string' ? path.split('.') : path).filter(Boolean);

const ensureNestedStructure = (draft: object, path: string | string[], pathParts: string[]) => {
  if (typeof path === 'string') {
    return ensurePath(draft, pathParts.join('.'));
  }

  return ensurePathParts(draft, pathParts);
};

const setValueAtPath = (draft: object, pathParts: string[], data: any, merge: boolean): void => {
  const parentPath = pathParts.slice(0, -1);
  const targetKey = pathParts.at(-1);
  const parentObject = parentPath.reduce((current, segment) => current[segment], draft as any);

  parentObject[targetKey] = merge ? mergeVMData(parentObject[targetKey], data) : data;
};

const applyVMUpdate = (
  currentVM: V1VirtualMachine,
  data: any,
  merge: boolean,
  path: string | string[],
): V1VirtualMachine => {
  const pathParts = parsePath(path);

  if (pathParts.length === 0) return currentVM;

  const updatedVM = produce(currentVM, (draft) => {
    ensureNestedStructure(draft, path, pathParts);
    setValueAtPath(draft, pathParts, data, merge);
  });

  return updatedVM;
};

type PatchCustomizeWizardVMSignalArgs = {
  data: any;
  merge?: boolean;
  path?: string | string[];
}[];

export type PatchCustomizeWizardVMSignal = (
  vmElementsToUpdate: PatchCustomizeWizardVMSignalArgs,
) => V1VirtualMachine;

export const patchCustomizeWizardVMSignal: PatchCustomizeWizardVMSignal = (vmElementsToUpdate) => {
  if (!customizeWizardVMSignal.value) {
    return undefined;
  }

  const initialVM = produce(customizeWizardVMSignal.value, (draft) => draft);

  const updatedVM = vmElementsToUpdate.reduce((currentVM, { data, merge = false, path }) => {
    if (path === undefined) return data;
    if (path === '') return currentVM;

    return applyVMUpdate(currentVM, data, merge, path);
  }, initialVM);

  customizeWizardVMSignal.value = updatedVM;

  return customizeWizardVMSignal.value;
};

export const updateVMCustomizeIT = (vm: V1VirtualMachine) =>
  Promise.resolve(patchCustomizeWizardVMSignal([{ data: vm }]));

export const setCustomizeWizardVMSignal = (vm: V1VirtualMachine | null) => {
  customizeWizardVMSignal.value = vm;
};
