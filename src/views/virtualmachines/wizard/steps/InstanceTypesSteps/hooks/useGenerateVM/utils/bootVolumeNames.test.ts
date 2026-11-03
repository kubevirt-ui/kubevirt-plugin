import { DNS1123SubdomainMaxLength } from '@kubevirt-utils/utils/dns1123SubdomainValidation';

import {
  getBootDataVolumeName,
  getIsoBlankDataVolumeName,
  getIsoCdromDiskName,
} from './bootVolumeNames';

describe('bootVolumeNames', () => {
  it('should append the suffix when the VM name is short', () => {
    expect(getBootDataVolumeName('my.vm')).toBe('my.vm-volume');
    expect(getIsoBlankDataVolumeName('my.vm')).toBe('my.vm-volume-blank');
    expect(getIsoCdromDiskName('my.vm')).toBe('my.vm-cdrom-iso');
  });

  it('should truncate the VM name so the full DataVolume name fits within 253 characters', () => {
    const vmName = 'a'.repeat(DNS1123SubdomainMaxLength);
    const volumeName = getBootDataVolumeName(vmName);

    expect(volumeName.length).toBeLessThanOrEqual(DNS1123SubdomainMaxLength);
    expect(volumeName.endsWith('-volume')).toBe(true);
  });

  it('should truncate for the longest ISO blank volume suffix', () => {
    const vmName = 'a'.repeat(DNS1123SubdomainMaxLength);
    const volumeName = getIsoBlankDataVolumeName(vmName);

    expect(volumeName.length).toBeLessThanOrEqual(DNS1123SubdomainMaxLength);
    expect(volumeName.endsWith('-volume-blank')).toBe(true);
  });
});
