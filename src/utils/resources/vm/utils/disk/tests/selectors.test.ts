import { V1Disk } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import {
  getDiskDrive,
  getDiskInterface,
  getPrintableDiskDrive,
  getPrintableDiskInterface,
} from '../selectors';

import { createDisk } from './mocks';

describe('disk selectors', () => {
  describe('getDiskDrive', () => {
    it.each([
      [{ disk: { bus: 'virtio' } }, 'disk', 'regular disk'],
      [{ cdrom: { bus: 'sata' }, disk: undefined }, 'cdrom', 'CD-ROM disk'],
      [{ disk: undefined, lun: { bus: 'scsi' } }, 'lun', 'LUN disk'],
    ])('should return "%s" for %s', (diskProps, expected, _description) => {
      const disk = createDisk(diskProps as Partial<V1Disk>);
      expect(getDiskDrive(disk)).toBe(expected);
    });

    it('should handle null input by returning "disk"', () => {
      expect(getDiskDrive(null as unknown as V1Disk)).toBe('disk');
    });
  });

  describe('getPrintableDiskDrive', () => {
    it.each([
      [{ disk: { bus: 'virtio' } }, 'Disk', 'regular disk'],
      [{ cdrom: { bus: 'sata' }, disk: undefined }, 'CD-ROM', 'cdrom disk'],
      [{ disk: undefined, lun: { bus: 'scsi' } }, 'LUN', 'lun disk'],
    ])('should return "%s" for %s', (diskProps, expected, _description) => {
      const disk = createDisk(diskProps as Partial<V1Disk>);
      expect(getPrintableDiskDrive(disk)).toBe(expected);
    });
  });

  describe('getDiskInterface', () => {
    it.each([
      [{ disk: { bus: 'virtio' } }, 'virtio', 'disk type'],
      [{ cdrom: { bus: 'sata' }, disk: undefined }, 'sata', 'cdrom type'],
      [{ disk: undefined, lun: { bus: 'scsi' } }, 'scsi', 'lun type'],
    ])('should return bus "%s" from %s', (diskProps, expected, _description) => {
      const disk = createDisk(diskProps as Partial<V1Disk>);
      expect(getDiskInterface(disk)).toBe(expected);
    });

    it('should return undefined when bus is missing', () => {
      const disk = createDisk({ disk: {} });
      expect(getDiskInterface(disk)).toBeUndefined();
    });
  });

  describe('getPrintableDiskInterface', () => {
    it.each([
      ['scsi', 'SCSI'],
      ['sata', 'SATA'],
      ['virtio', 'virtio'],
    ])('should format bus "%s" as "%s"', (bus, expected) => {
      const disk = createDisk({ disk: { bus } });
      expect(getPrintableDiskInterface(disk)).toBe(expected);
    });

    it.each([
      [{ disk: {} }, 'missing bus'],
      [null, 'null disk'],
    ])('should return empty string for %s', (diskInput, _description) => {
      const disk = diskInput ? createDisk(diskInput) : null;
      expect(getPrintableDiskInterface(disk as V1Disk)).toBe('');
    });
  });
});
