import { DNS1123LabelMaxLength } from '@kubevirt-utils/utils/validation';

/** Wizard-created DataVolume names are capped at 63 characters for migration-safe derived names. */
export const wizardDataVolumeNameMaxLength = DNS1123LabelMaxLength;

const stripTrailingNameSeparators = (name: string): string => name.replace(/[.-]+$/, '');

const truncateWithSuffix = (prefix: string, suffix: string, maxLength: number): string => {
  const separator = suffix ? '-' : '';
  const fullName = `${prefix}${separator}${suffix}`;
  if (fullName.length <= maxLength) {
    return fullName;
  }

  const availableLength = maxLength - suffix.length - separator.length;
  let truncatedPrefix = prefix.slice(0, Math.max(1, availableLength));
  truncatedPrefix = stripTrailingNameSeparators(truncatedPrefix) || prefix.slice(0, 1);
  return `${truncatedPrefix}${separator}${suffix}`;
};

/** Boot source DataVolume name derived from the VM name. */
export const getBootDataVolumeName = (vmName: string): string =>
  truncateWithSuffix(vmName, 'volume', wizardDataVolumeNameMaxLength);

/** Blank DataVolume used as the root disk when booting from ISO. */
export const getIsoBlankDataVolumeName = (vmName: string): string =>
  truncateWithSuffix(vmName, 'volume-blank', wizardDataVolumeNameMaxLength);

/** CD-ROM disk/volume name when booting from ISO (DNS label: no dots, max 63 characters). */
export const getIsoCdromDiskName = (vmName: string): string =>
  truncateWithSuffix(vmName.replace(/\./g, '-'), 'cdrom-iso', wizardDataVolumeNameMaxLength);
