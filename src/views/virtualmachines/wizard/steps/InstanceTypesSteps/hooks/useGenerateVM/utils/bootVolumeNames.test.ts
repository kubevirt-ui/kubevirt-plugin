import { DNS1123LabelMaxLength } from '@kubevirt-utils/utils/validation';

import {
  getBootDataVolumeName,
  getIsoBlankDataVolumeName,
  getIsoCdromDiskName,
  wizardDataVolumeNameMaxLength,
} from './bootVolumeNames';

describe('bootVolumeNames', () => {
  it('should append the suffix when the VM name is short', () => {
    expect(getBootDataVolumeName('my.vm')).toBe('my.vm-volume');
    expect(getIsoBlankDataVolumeName('my.vm')).toBe('my.vm-volume-blank');
    expect(getIsoCdromDiskName('my.vm')).toBe('my-vm-cdrom-iso');
  });

  it('should truncate the VM name prefix to fit the suffix within 63 characters', () => {
    const vmName = 'a'.repeat(DNS1123LabelMaxLength);
    expect(getBootDataVolumeName(vmName)).toBe(`${'a'.repeat(56)}-volume`);
    expect(getIsoBlankDataVolumeName(vmName)).toBe(`${'a'.repeat(50)}-volume-blank`);
  });

  it('should strip a trailing dot from the truncated prefix for boot DataVolume names', () => {
    const vmName = `${'a'.repeat(54)}.${'b'.repeat(9)}`;
    const volumeName = getBootDataVolumeName(vmName);

    expect(volumeName.length).toBeLessThanOrEqual(wizardDataVolumeNameMaxLength);
    expect(volumeName.endsWith('-volume')).toBe(true);
    expect(volumeName).not.toMatch(/\.-/);
  });

  it('should use a DNS label for ISO CD-ROM disk names', () => {
    const vmName = 'a'.repeat(100);
    const cdromName = getIsoCdromDiskName(vmName);

    expect(cdromName.length).toBeLessThanOrEqual(wizardDataVolumeNameMaxLength);
    expect(cdromName).not.toContain('.');
    expect(cdromName.endsWith('-cdrom-iso')).toBe(true);
  });
});
