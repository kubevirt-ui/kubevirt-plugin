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

export const hasBulkFolderDestinationChanged = (
  sourceFolderName: string | null,
  destinationFolderName: string | undefined,
): boolean => {
  if (sourceFolderName === null) {
    return destinationFolderName !== undefined;
  }

  return hasFolderDestinationChanged(sourceFolderName, destinationFolderName);
};

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

export const getMoveGroupSummaryChangePhrase = (
  t: TFunction,
  sourceFolderName: string | null,
  destinationFolderName: string | undefined,
): string | undefined => {
  if (sourceFolderName === null || destinationFolderName === undefined) {
    return undefined;
  }

  if (!hasFolderDestinationChanged(sourceFolderName, destinationFolderName)) {
    return undefined;
  }

  const phrase = getMoveGroupChangePhrase(t, sourceFolderName, destinationFolderName);

  return phrase || undefined;
};

export const getSingleVmMoveGroupSummary = (
  t: TFunction,
  vmName: string,
  namespace: string,
  sourceFolderName: string,
  destinationFolderName: string,
): string => {
  const summary = t('Move {{vmName}} VirtualMachine in namespace {{namespace}}', {
    namespace,
    vmName,
  });
  const changePhrase = getMoveGroupSummaryChangePhrase(t, sourceFolderName, destinationFolderName);

  return changePhrase ? `${summary} ${changePhrase}` : summary;
};

export const getMoveToFolderSubmitDisabledTooltip = (
  folderName: string | undefined,
  sourceFolderName: string | null,
  destinationFolderName: string | undefined,
  t: TFunction,
): string | undefined => {
  const hasDestinationChanged = hasBulkFolderDestinationChanged(
    sourceFolderName,
    destinationFolderName,
  );

  if (!hasDestinationChanged) {
    return sourceFolderName === null
      ? t('Select a destination group')
      : t('Select a different group to save changes');
  }

  return getFolderNameValidationError(folderName ?? '', t);
};
