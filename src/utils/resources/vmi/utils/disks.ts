import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ROOTDISK } from '@kubevirt-utils/constants/constants';

export const getVMIBootDisk = (vmi: V1VirtualMachineInstance) => {
  const vmiDisks = vmi?.spec?.domain?.devices?.disks || [];
  const vmiVolumes = vmi?.spec?.volumes || [];
  const hasRootDiskVolume = vmiVolumes.some((volume) => volume.name === ROOTDISK);
  const disksWithBootOrder = vmiDisks.filter((disk) => disk.bootOrder);
  if (disksWithBootOrder.length > 0) {
    return disksWithBootOrder.reduce((acc, disk) => {
      return acc.bootOrder < disk.bootOrder ? acc : disk;
    });
  }
  if (hasRootDiskVolume) {
    return { name: ROOTDISK };
  }
  return vmiDisks[0];
};
