import { V1Disk } from '@kubevirt-ui/kubevirt-api/kubevirt';

export const NAME_INPUT_FIELD = 'NAME';

export const INSTALLATION_CDROM_NAME = 'installation-cdrom';

export const INSTALLATION_CDROM_DISK: V1Disk = {
  name: INSTALLATION_CDROM_NAME,
  cdrom: {
    bus: 'sata',
  },
  bootOrder: 1,
};
