import { V1Disk, V1Volume } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { isRunning } from '@virtualmachines/utils';

import {
  getCDROMSourceName,
  getCDROMStatus,
  getContainerDiskImage,
  hasContainerDisk,
  hasDataVolume,
  hasPersistentVolumeClaim,
  isCDROMDisk,
  isCDROMMounted,
} from '../selectors';

import { createDisk, createVM, createVMI, createVolume } from './mocks';

jest.mock('@virtualmachines/utils', () => ({
  isRunning: jest.fn(),
}));

jest.mock('@kubevirt-utils/resources/vm', () => ({
  getDisks: jest.fn(),
  getVolumes: jest.fn(),
}));

describe('CD-ROM selectors', () => {
  const mockIsRunning = isRunning as jest.Mock;
  const mockGetDisks = getDisks as jest.Mock;
  const mockGetVolumes = getVolumes as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isCDROMDisk', () => {
    it.each([
      [{ cdrom: { bus: 'sata' }, disk: undefined }, true, 'CD-ROM disk'],
      [{ disk: { bus: 'virtio' } }, false, 'regular disk'],
    ])('should return %s for %s', (diskProps, expected, _description) => {
      const disk = createDisk(diskProps as Partial<V1Disk>);
      expect(isCDROMDisk(disk)).toBe(expected);
    });

    it('should return false for null input', () => {
      expect(isCDROMDisk(null as unknown as V1Disk)).toBe(false);
    });
  });

  describe('getCDROMSourceName', () => {
    it.each([
      [{ dataVolume: { name: 'my-dv' } }, 'my-dv', 'dataVolume'],
      [{ persistentVolumeClaim: { claimName: 'my-pvc' } }, 'my-pvc', 'PVC'],
      [
        { containerDisk: { image: 'registry.io/image:tag' } },
        'registry.io/image:tag',
        'containerDisk',
      ],
      [{}, '', 'no source'],
    ])('should return "%s" for %s', (volumeProps, expected, _description) => {
      const volume = createVolume(volumeProps as Partial<V1Volume>);
      expect(getCDROMSourceName(volume)).toBe(expected);
    });
  });

  describe('isCDROMMounted', () => {
    it.each([
      [{ dataVolume: { name: 'my-dv' } }, true, 'source exists'],
      [{}, false, 'no source'],
    ])('should return %s when %s', (volumeProps, expected, _description) => {
      const volume = createVolume(volumeProps as Partial<V1Volume>);
      expect(isCDROMMounted(volume)).toBe(expected);
    });
  });

  describe('hasDataVolume', () => {
    it.each([
      [{ dataVolume: { name: 'my-dv' } }, true, 'dataVolume exists'],
      [{}, false, 'dataVolume absent'],
    ])('should return %s when %s', (volumeProps, expected, _description) => {
      const volume = createVolume(volumeProps as Partial<V1Volume>);
      expect(hasDataVolume(volume)).toBe(expected);
    });

    it('should return false for null volume', () => {
      expect(hasDataVolume(null as unknown as V1Volume)).toBe(false);
    });
  });

  describe('hasPersistentVolumeClaim', () => {
    it.each([
      [{ persistentVolumeClaim: { claimName: 'my-pvc' } }, true, 'PVC exists'],
      [{}, false, 'PVC absent'],
    ])('should return %s when %s', (volumeProps, expected, _description) => {
      const volume = createVolume(volumeProps as Partial<V1Volume>);
      expect(hasPersistentVolumeClaim(volume)).toBe(expected);
    });

    it('should return false for null volume', () => {
      expect(hasPersistentVolumeClaim(null as unknown as V1Volume)).toBe(false);
    });
  });

  describe('hasContainerDisk', () => {
    it.each([
      [{ containerDisk: { image: 'registry.io/image' } }, true, 'containerDisk exists'],
      [{}, false, 'containerDisk absent'],
    ])('should return %s when %s', (volumeProps, expected, _description) => {
      const volume = createVolume(volumeProps as Partial<V1Volume>);
      expect(hasContainerDisk(volume)).toBe(expected);
    });

    it('should return false for null volume', () => {
      expect(hasContainerDisk(null as unknown as V1Volume)).toBe(false);
    });
  });

  describe('getContainerDiskImage', () => {
    it.each([
      [
        { containerDisk: { image: 'Registry.IO/Image:TAG' } },
        'registry.io/image:tag',
        'lowercase image',
      ],
      [{}, null, 'null when absent'],
    ])('should return %s for %s', (volumeProps, expected, _description) => {
      const volume = createVolume(volumeProps as Partial<V1Volume>);
      expect(getContainerDiskImage(volume)).toBe(expected);
    });

    it('should return null for null volume', () => {
      expect(getContainerDiskImage(null as unknown as V1Volume)).toBeNull();
    });
  });

  describe('getCDROMStatus', () => {
    it('should return correct status for stopped VM with mounted CD-ROM', () => {
      const cdromDisk = createDisk({ cdrom: { bus: 'sata' }, disk: undefined, name: 'cdrom-disk' });
      const volume = createVolume({ dataVolume: { name: 'my-dv' }, name: 'cdrom-disk' });
      const vm = createVM('test-vm');

      mockIsRunning.mockReturnValue(false);
      mockGetDisks.mockReturnValue([cdromDisk]);
      mockGetVolumes.mockReturnValue([volume]);

      const result = getCDROMStatus(vm);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        canDelete: true,
        canEject: false,
        canMount: false,
        isMounted: true,
        name: 'cdrom-disk',
        sourceName: 'my-dv',
      });
    });

    it('should return correct status for running VM with mounted CD-ROM', () => {
      const cdromDisk = createDisk({ cdrom: { bus: 'sata' }, disk: undefined, name: 'cdrom-disk' });
      const volume = createVolume({ dataVolume: { name: 'my-dv' }, name: 'cdrom-disk' });
      const vmi = createVMI([cdromDisk], [volume]);
      const vm = createVM('test-vm');

      mockIsRunning.mockReturnValue(true);

      const result = getCDROMStatus(vm, vmi);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        canDelete: false,
        canEject: true,
        canMount: false,
        isMounted: true,
        name: 'cdrom-disk',
      });
    });

    it('should return correct status for running VM with unmounted CD-ROM', () => {
      const cdromDisk = createDisk({ cdrom: { bus: 'sata' }, disk: undefined, name: 'cdrom-disk' });
      const volume = createVolume({ name: 'cdrom-disk' }); // No source
      const vmi = createVMI([cdromDisk], [volume]);
      const vm = createVM('test-vm');

      mockIsRunning.mockReturnValue(true);

      const result = getCDROMStatus(vm, vmi);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        canDelete: false,
        canEject: false,
        canMount: true,
        isMounted: false,
        name: 'cdrom-disk',
        sourceName: null,
      });
    });

    it('should return empty array when no CD-ROMs exist', () => {
      const regularDisk = createDisk({ disk: { bus: 'virtio' }, name: 'regular-disk' });
      const vm = createVM('test-vm');

      mockIsRunning.mockReturnValue(false);
      mockGetDisks.mockReturnValue([regularDisk]);
      mockGetVolumes.mockReturnValue([]);

      const result = getCDROMStatus(vm);

      expect(result).toHaveLength(0);
    });

    describe('edge cases', () => {
      it('should handle multiple CD-ROMs with mixed mount states', () => {
        const cdrom1 = createDisk({
          cdrom: { bus: 'sata' },
          disk: undefined,
          name: 'cdrom-mounted',
        });
        const cdrom2 = createDisk({
          cdrom: { bus: 'sata' },
          disk: undefined,
          name: 'cdrom-unmounted',
        });
        const cdrom3 = createDisk({
          cdrom: { bus: 'sata' },
          disk: undefined,
          name: 'cdrom-pvc-source',
        });
        const regularDisk = createDisk({ disk: { bus: 'virtio' }, name: 'regular-disk' });

        const volume1 = createVolume({ dataVolume: { name: 'dv-source' }, name: 'cdrom-mounted' });
        const volume2 = createVolume({ name: 'cdrom-unmounted' }); // No source
        const volume3 = createVolume({
          name: 'cdrom-pvc-source',
          persistentVolumeClaim: { claimName: 'pvc-source' },
        });
        const regularVolume = createVolume({ name: 'regular-disk' });

        const vm = createVM('test-vm');

        mockIsRunning.mockReturnValue(false);
        mockGetDisks.mockReturnValue([cdrom1, cdrom2, cdrom3, regularDisk]);
        mockGetVolumes.mockReturnValue([volume1, volume2, volume3, regularVolume]);

        const result = getCDROMStatus(vm);

        expect(result).toHaveLength(3);

        // First CD-ROM: mounted with dataVolume
        expect(result[0]).toMatchObject({
          canDelete: true,
          canEject: false,
          canMount: false,
          isMounted: true,
          name: 'cdrom-mounted',
          sourceName: 'dv-source',
        });

        // Second CD-ROM: unmounted
        expect(result[1]).toMatchObject({
          canDelete: true,
          canEject: false,
          canMount: false,
          isMounted: false,
          name: 'cdrom-unmounted',
          sourceName: null,
        });

        // Third CD-ROM: mounted with PVC
        expect(result[2]).toMatchObject({
          canDelete: true,
          canEject: false,
          canMount: false,
          isMounted: true,
          name: 'cdrom-pvc-source',
          sourceName: 'pvc-source',
        });
      });

      it('should handle CD-ROM without matching volume', () => {
        const cdromDisk = createDisk({
          cdrom: { bus: 'sata' },
          disk: undefined,
          name: 'orphan-cdrom',
        });
        const unrelatedVolume = createVolume({ dataVolume: { name: 'dv' }, name: 'other-volume' });
        const vm = createVM('test-vm');

        mockIsRunning.mockReturnValue(false);
        mockGetDisks.mockReturnValue([cdromDisk]);
        mockGetVolumes.mockReturnValue([unrelatedVolume]);

        const result = getCDROMStatus(vm);

        expect(result).toHaveLength(1);
        expect(result[0]).toMatchObject({
          canDelete: true,
          canEject: false,
          canMount: false,
          isMounted: false,
          name: 'orphan-cdrom',
          sourceName: null,
        });
        expect(result[0].volume).toBeUndefined();
      });

      it('should return empty array when running VM has no VMI provided', () => {
        const vm = createVM('test-vm');

        mockIsRunning.mockReturnValue(true);
        // VMI not provided, so vmi?.spec?.domain?.devices?.disks will be undefined
        // The fallback || [] ensures this returns empty array instead of throwing

        const result = getCDROMStatus(vm, undefined);

        expect(result).toHaveLength(0);
      });

      it('should handle VM with null disks from getDisks', () => {
        const vm = createVM('test-vm');

        mockIsRunning.mockReturnValue(false);
        mockGetDisks.mockReturnValue(null);
        mockGetVolumes.mockReturnValue([]);

        const result = getCDROMStatus(vm);

        // getDisks(vm) || [] should fallback to empty array
        expect(result).toHaveLength(0);
      });
    });

    it('should return correct status for stopped VM with unmounted CD-ROM', () => {
      const cdromDisk = createDisk({ cdrom: { bus: 'sata' }, disk: undefined, name: 'cdrom-disk' });
      const volume = createVolume({ name: 'cdrom-disk' }); // No source
      const vm = createVM('test-vm');

      mockIsRunning.mockReturnValue(false);
      mockGetDisks.mockReturnValue([cdromDisk]);
      mockGetVolumes.mockReturnValue([volume]);

      const result = getCDROMStatus(vm);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        canDelete: true,
        canEject: false,
        canMount: false,
        isMounted: false,
        name: 'cdrom-disk',
        sourceName: null,
      });
    });
  });
});
