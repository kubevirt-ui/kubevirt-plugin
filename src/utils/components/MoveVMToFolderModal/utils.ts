import { type TFunction } from 'i18next';

import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getFolderNameValidationError } from '@kubevirt-utils/components/FolderSelect/utils/validation';
import { getLabel } from '@kubevirt-utils/resources/shared';
import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

export const isVMInGroup =
  (group: string) =>
  (vm: V1VirtualMachine): boolean =>
    getLabel(vm, VM_FOLDER_LABEL) === group;

export const getInitialFolderName = (vm: V1VirtualMachine): string =>
  getLabel(vm, VM_FOLDER_LABEL) ?? '';

const getVmFolderNames = (vms: V1VirtualMachine[]): string[] =>
  vms.map((vm) => getLabel(vm, VM_FOLDER_LABEL) ?? '');

export const getBulkSharedFolderName = (vms: V1VirtualMachine[]): string | null => {
  if (vms.length === 0) {
    return null;
  }

  const folders = getVmFolderNames(vms);
  const firstFolder = folders[0];

  return folders.every((folder) => folder === firstFolder) ? firstFolder : null;
};

export const getBulkInitialFolderName = (vms: V1VirtualMachine[]): string =>
  getBulkSharedFolderName(vms) ?? '';

export const getFolderDisplayName = (folderName: string | undefined, t: TFunction): string => {
  if (!folderName) {
    return t('Project root');
  }

  return folderName;
};

export const getBulkSourceGroupDisplayName = (
  vms: V1VirtualMachine[],
  t: TFunction,
): string | undefined => {
  const sharedFolderName = getBulkSharedFolderName(vms);

  if (sharedFolderName === null) {
    return undefined;
  }

  return getFolderDisplayName(sharedFolderName, t);
};

export const hasFolderDestinationChanged = (
  initialFolderName: string,
  folderName: string | undefined,
): boolean => (folderName ?? '') !== initialFolderName;

export const getMoveToFolderSubmitDisabledTooltip = (
  folderName: string | undefined,
  hasDestinationChanged: boolean,
  t: TFunction,
): string | undefined => {
  if (!hasDestinationChanged) {
    return t('Select a different group to save changes');
  }

  return getFolderNameValidationError(folderName ?? '', t);
};
