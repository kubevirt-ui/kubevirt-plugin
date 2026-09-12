import { VM_FOLDER_LABEL } from '@virtualmachines/tree/utils/constants';

const VM_FOLDER_LABEL_PREFIX = `${VM_FOLDER_LABEL}=`;

export const isFolderLabel = (label: string): boolean =>
  label?.startsWith(VM_FOLDER_LABEL_PREFIX) ?? false;

export const getFolderNameFromLabel = (label: string): string | undefined =>
  isFolderLabel(label) ? label.slice(VM_FOLDER_LABEL_PREFIX.length) || undefined : undefined;

export const buildFolderLabel = (folderName: string): string =>
  `${VM_FOLDER_LABEL_PREFIX}${folderName}`;
