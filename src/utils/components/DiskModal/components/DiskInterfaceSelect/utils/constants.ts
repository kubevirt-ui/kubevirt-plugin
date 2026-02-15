import { InterfaceTypes } from '@kubevirt-utils/components/DiskModal/utils/types';

export const diskInterfaceOptions: Record<InterfaceTypes, { description: string; label: string }> =
  {
    [InterfaceTypes.SATA]: {
      description:
        'Supported by most operating systems including Windows out of the box. Offers lower performance compared to virtio. Consider using it for CD-ROM devices.',
      label: 'SATA',
    },
    [InterfaceTypes.SCSI]: {
      description:
        'Paravirtualized iSCSI HDD driver offers similar functionality to the virtio-block device, with some additional enhancements. In particular, this driver supports adding hundreds of devices, and names devices using the standard SCSI device naming scheme.',
      label: 'SCSI',
    },
    [InterfaceTypes.VIRTIO]: {
      description:
        'Optimized for best performance. Supported by most Linux distributions. Windows requires additional drivers to use this model.',
      label: 'VirtIO',
    },
  };
