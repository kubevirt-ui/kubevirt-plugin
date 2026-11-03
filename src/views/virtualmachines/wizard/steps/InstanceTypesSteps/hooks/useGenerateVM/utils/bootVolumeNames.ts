import { DNS1123SubdomainMaxLength } from '@kubevirt-utils/utils/dns1123SubdomainValidation';
import { truncateToK8sName } from '@kubevirt-utils/utils/nameGenerators';

const truncateWizardBootResourceName = (vmName: string, suffix: string): string =>
  truncateToK8sName(vmName, suffix, DNS1123SubdomainMaxLength);

/** Boot source DataVolume name derived from the VM name. */
export const getBootDataVolumeName = (vmName: string): string =>
  truncateWizardBootResourceName(vmName, 'volume');

/** Blank DataVolume used as the root disk when booting from ISO. */
export const getIsoBlankDataVolumeName = (vmName: string): string =>
  truncateWizardBootResourceName(vmName, 'volume-blank');

/** CD-ROM disk/volume name when booting from ISO. */
export const getIsoCdromDiskName = (vmName: string): string =>
  truncateWizardBootResourceName(vmName, 'cdrom-iso');
