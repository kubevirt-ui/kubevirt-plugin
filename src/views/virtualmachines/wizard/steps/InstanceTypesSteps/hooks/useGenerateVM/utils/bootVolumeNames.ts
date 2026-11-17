import { truncateWithSuffix } from '@kubevirt-utils/utils/truncateWithSuffix';
import { DNS1123LabelMaxLength } from '@kubevirt-utils/utils/validation';

/** Wizard-created DataVolume names are capped at 63 characters for migration-safe derived names. */
export const wizardDataVolumeNameMaxLength = DNS1123LabelMaxLength;

/** Boot source DataVolume name derived from the VM name. */
export const getBootDataVolumeName = (vmName: string): string =>
  truncateWithSuffix(vmName, 'volume', wizardDataVolumeNameMaxLength);

/** Blank DataVolume used as the root disk when booting from ISO. */
export const getIsoBlankDataVolumeName = (vmName: string): string =>
  truncateWithSuffix(vmName, 'volume-blank', wizardDataVolumeNameMaxLength);

/** CD-ROM disk/volume name when booting from ISO (DNS label: no dots, max 63 characters). */
export const getIsoCdromDiskName = (vmName: string): string =>
  truncateWithSuffix(vmName.replace(/\./g, '-'), 'cdrom-iso', wizardDataVolumeNameMaxLength);
