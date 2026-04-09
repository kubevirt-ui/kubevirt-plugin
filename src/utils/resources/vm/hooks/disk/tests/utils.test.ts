import { V1Disk } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { createDisk, createVMI } from '@kubevirt-utils/resources/vm/utils/disk/tests/mocks';

import { enrichDisksWithVMIBusInfo } from '../utils';

describe('enrichDisksWithVMIBusInfo', () => {
  it('should add bus from VMI when VM disk has no bus', () => {
    const vmDisks: V1Disk[] = [{ disk: {}, name: 'rootdisk' }];
    const vmi = createVMI([{ disk: { bus: 'scsi' }, name: 'rootdisk' }]);

    const result = enrichDisksWithVMIBusInfo(vmDisks, vmi);

    expect(result[0].disk.bus).toBe('scsi');
  });

  it('should not override existing VM disk bus', () => {
    const vmDisks: V1Disk[] = [{ disk: { bus: 'virtio' }, name: 'rootdisk' }];
    const vmi = createVMI([{ disk: { bus: 'scsi' }, name: 'rootdisk' }]);

    const result = enrichDisksWithVMIBusInfo(vmDisks, vmi);

    expect(result[0].disk.bus).toBe('virtio');
  });

  it('should handle VMI without matching disk', () => {
    const vmDisks: V1Disk[] = [{ disk: {}, name: 'rootdisk' }];
    const vmi = createVMI([{ disk: { bus: 'scsi' }, name: 'other-disk' }]);

    const result = enrichDisksWithVMIBusInfo(vmDisks, vmi);

    expect(result[0].disk.bus).toBeUndefined();
  });

  it('should handle multiple disks with mixed bus states', () => {
    const vmDisks: V1Disk[] = [
      { disk: { bus: 'virtio' }, name: 'disk-with-bus' },
      { disk: {}, name: 'disk-without-bus' },
      { cdrom: {}, name: 'cdrom-without-bus' },
    ];
    const vmi = createVMI([
      { disk: { bus: 'virtio' }, name: 'disk-with-bus' },
      { disk: { bus: 'scsi' }, name: 'disk-without-bus' },
      { cdrom: { bus: 'sata' }, name: 'cdrom-without-bus' },
    ]);

    const result = enrichDisksWithVMIBusInfo(vmDisks, vmi);

    expect(result[0].disk.bus).toBe('virtio');
    expect(result[1].disk.bus).toBe('scsi');
    expect(result[2].cdrom.bus).toBe('sata');
  });

  it('should handle null VMI', () => {
    const vmDisks: V1Disk[] = [createDisk({ disk: {} })];

    const result = enrichDisksWithVMIBusInfo(vmDisks, null);

    expect(result[0].disk.bus).toBeUndefined();
  });

  it('should handle empty disk lists', () => {
    const vmi = createVMI([{ disk: { bus: 'scsi' }, name: 'rootdisk' }]);

    const result = enrichDisksWithVMIBusInfo([], vmi);

    expect(result).toEqual([]);
  });
});
