import { type UseFormGetValues, type UseFormSetValue } from 'react-hook-form';
import produce from 'immer';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import {
  ensureNestedStructure,
  isMutableObject,
  parsePath,
  setValueAtPath,
} from '@kubevirt-utils/signals/customizeWizardVMSignalPathUtils';

import { type VMWizardFormValues } from '../form/types';

/* TODO: this file is a copy of customizedWizardVMSignal.ts file, but manage the form field values instead of the signal.
after we migrate the wizard to use the form values instead of the signal, we can remove the previous file.
CNV-97978
**/
type PatchWizardCustomizedVMReplace = {
  data: V1VirtualMachine;
  merge?: never;
  path?: undefined;
};

type PatchWizardCustomizedVMUpdate = {
  data: unknown;
  merge?: boolean;
  path: string | string[];
};

export type PatchWizardCustomizedVMArgs = (
  | PatchWizardCustomizedVMReplace
  | PatchWizardCustomizedVMUpdate
)[];

const isVMReplaceEntry = (
  entry: PatchWizardCustomizedVMReplace | PatchWizardCustomizedVMUpdate,
): entry is PatchWizardCustomizedVMReplace => entry.path === undefined;

const mergeVMData = (currentData: unknown, updateData: unknown): unknown => {
  if (currentData == null && updateData == null) {
    return {};
  }

  if (currentData == null) {
    return updateData;
  }

  if (updateData == null) {
    return currentData;
  }

  if (Array.isArray(currentData) || Array.isArray(updateData)) {
    const currentArray = Array.isArray(currentData) ? currentData : [];
    const updateArray = Array.isArray(updateData) ? updateData : [];
    return currentArray.concat(updateArray);
  }

  if (isMutableObject(currentData) && isMutableObject(updateData)) {
    return { ...currentData, ...updateData };
  }

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

const applyVMPatches = (
  initialVM: V1VirtualMachine,
  vmElementsToUpdate: PatchWizardCustomizedVMArgs,
): V1VirtualMachine =>
  vmElementsToUpdate.reduce<V1VirtualMachine>((currentVM, entry) => {
    if (isVMReplaceEntry(entry)) {
      return entry.data;
    }
    if (entry.path === '') {
      return currentVM;
    }

    return applyVMUpdate(currentVM, entry.data, entry.merge ?? false, entry.path);
  }, initialVM);

export const patchWizardCustomizedVM = (
  getValues: UseFormGetValues<VMWizardFormValues>,
  setValue: UseFormSetValue<VMWizardFormValues>,
  patches: PatchWizardCustomizedVMArgs,
): V1VirtualMachine | undefined => {
  if (patches.length === 0) {
    return undefined;
  }

  const currentCustomized = (getValues('customization.vmDraft') ?? {}) as V1VirtualMachine;
  const initialVM = produce(currentCustomized, (draft) => draft);
  const updatedVM = applyVMPatches(initialVM, patches);

  setValue('customization.vmDraft', updatedVM, { shouldValidate: true });

  return updatedVM;
};
