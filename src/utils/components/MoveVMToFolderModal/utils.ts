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

export const isProjectRootFolder = (folderName: string | undefined): boolean => !folderName;

export const getFolderDisplayName = (folderName: string | undefined, t: TFunction): string => {
  if (isProjectRootFolder(folderName)) {
    return t('Project root');
  }

  return folderName;
};

export const hasFolderDestinationChanged = (
  initialFolderName: string,
  folderName: string | undefined,
): boolean => (folderName ?? '') !== initialFolderName;

export const shouldShowBulkMoveGroupChange = (
  hasDestinationChanged: boolean,
  hasSharedSourceFolder: boolean,
): boolean => hasDestinationChanged && hasSharedSourceFolder;

export const getMoveGroupChangePhrase = (
  t: TFunction,
  sourceFolderName: string,
  destinationFolderName: string,
): string => {
  const isSourceProjectRoot = isProjectRootFolder(sourceFolderName);
  const isDestinationProjectRoot = isProjectRootFolder(destinationFolderName);
  const sourceGroupName = getFolderDisplayName(sourceFolderName, t);
  const destinationGroupName = getFolderDisplayName(destinationFolderName, t);

  if (isSourceProjectRoot && isDestinationProjectRoot) {
    return '';
  }

  if (!isSourceProjectRoot && !isDestinationProjectRoot) {
    return t('from group "{{sourceGroupName}}" to group "{{destinationGroupName}}"', {
      destinationGroupName,
      sourceGroupName,
    });
  }

  if (!isSourceProjectRoot && isDestinationProjectRoot) {
    return t('from group "{{sourceGroupName}}" to project root', { sourceGroupName });
  }

  return t('from project root to group "{{destinationGroupName}}"', { destinationGroupName });
};

export const getSingleVmMoveGroupSummary = (
  t: TFunction,
  vmName: string,
  namespace: string,
  hasDestinationChanged: boolean,
  sourceFolderName: string,
  destinationFolderName: string,
): string => {
  const values = { namespace, vmName };

  if (!hasDestinationChanged) {
    return t('Move {{vmName}} VirtualMachine in namespace {{namespace}}', values);
  }

  const sourceGroupName = getFolderDisplayName(sourceFolderName, t);
  const destinationGroupName = getFolderDisplayName(destinationFolderName, t);
  const isSourceProjectRoot = isProjectRootFolder(sourceFolderName);
  const isDestinationProjectRoot = isProjectRootFolder(destinationFolderName);

  if (!isSourceProjectRoot && !isDestinationProjectRoot) {
    return t(
      'Move {{vmName}} VirtualMachine in namespace {{namespace}} from group "{{sourceGroupName}}" to group "{{destinationGroupName}}"',
      { ...values, destinationGroupName, sourceGroupName },
    );
  }

  if (!isSourceProjectRoot && isDestinationProjectRoot) {
    return t(
      'Move {{vmName}} VirtualMachine in namespace {{namespace}} from group "{{sourceGroupName}}" to project root',
      { ...values, sourceGroupName },
    );
  }

  if (isSourceProjectRoot && !isDestinationProjectRoot) {
    return t(
      'Move {{vmName}} VirtualMachine in namespace {{namespace}} from project root to group "{{destinationGroupName}}"',
      { ...values, destinationGroupName },
    );
  }

  return t('Move {{vmName}} VirtualMachine in namespace {{namespace}}', values);
};

export const getBulkVmsMoveGroupSummaryChangePhrase = (
  t: TFunction,
  hasDestinationChanged: boolean,
  hasSharedSourceFolder: boolean,
  sourceFolderName: string,
  destinationFolderName: string,
): string | undefined => {
  if (!shouldShowBulkMoveGroupChange(hasDestinationChanged, hasSharedSourceFolder)) {
    return undefined;
  }

  const phrase = getMoveGroupChangePhrase(t, sourceFolderName, destinationFolderName);

  return phrase || undefined;
};

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
