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

  it('should keep boot DataVolume names within 63 characters', () => {
    const vmName = 'a'.repeat(DNS1123LabelMaxLength);
    const volumeName = getBootDataVolumeName(vmName);
    const blankVolumeName = getIsoBlankDataVolumeName(vmName);

    expect(volumeName.length).toBeLessThanOrEqual(wizardDataVolumeNameMaxLength);
    expect(blankVolumeName.length).toBeLessThanOrEqual(wizardDataVolumeNameMaxLength);
    expect(volumeName.endsWith('-volume')).toBe(true);
    expect(blankVolumeName.endsWith('-volume-blank')).toBe(true);
    expect(volumeName).not.toMatch(/\.-/);
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
