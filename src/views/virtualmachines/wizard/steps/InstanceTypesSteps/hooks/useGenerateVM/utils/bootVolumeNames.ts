import { DNS1123SubdomainMaxLength } from '@kubevirt-utils/utils/dns1123SubdomainValidation';
import { DNS1123LabelMaxLength } from '@kubevirt-utils/utils/validation';

const stripTrailingNameSeparators = (name: string): string => name.replace(/[.-]+$/, '');

const truncateWithSuffix = (vmName: string, suffix: string, maxLength: number): string => {
  const separator = suffix ? '-' : '';
  const fullName = `${vmName}${separator}${suffix}`;
  if (fullName.length <= maxLength) {
    return fullName;
  }

  const availableLength = maxLength - suffix.length - separator.length;
  let truncatedName = vmName.slice(0, Math.max(1, availableLength));
  truncatedName = stripTrailingNameSeparators(truncatedName) || vmName.slice(0, 1);
  return `${truncatedName}${separator}${suffix}`;
};

const truncateWizardBootDataVolumeName = (vmName: string, suffix: string): string =>
  truncateWithSuffix(vmName, suffix, DNS1123SubdomainMaxLength);

/** Boot source DataVolume name derived from the VM name. */
export const getBootDataVolumeName = (vmName: string): string =>
  truncateWizardBootDataVolumeName(vmName, 'volume');

/** Blank DataVolume used as the root disk when booting from ISO. */
export const getIsoBlankDataVolumeName = (vmName: string): string =>
  truncateWizardBootDataVolumeName(vmName, 'volume-blank');

/** CD-ROM disk/volume name when booting from ISO (DNS label: no dots, max 63 characters). */
export const getIsoCdromDiskName = (vmName: string): string =>
  truncateWithSuffix(vmName.replace(/\./g, '-'), 'cdrom-iso', DNS1123LabelMaxLength);
