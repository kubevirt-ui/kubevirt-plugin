import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { ROOTDISK } from '@kubevirt-utils/constants/constants';

export const getVMIBootDisk = (vmi: V1VirtualMachineInstance) => {
  const vmiDisks = vmi?.spec?.domain?.devices?.disks || [];
  const vmiVolumes = vmi?.spec?.volumes || [];

  // Check if there's a rootdisk volume (indicates InstanceType VM)
  const hasRootDiskVolume = vmiVolumes.some((volume) => volume.name === ROOTDISK);

  // Check for disks with explicit bootOrder
  const disksWithBootOrder = vmiDisks.filter((disk) => disk.bootOrder);
  if (disksWithBootOrder.length > 0) {
    return disksWithBootOrder.reduce((acc, disk) => {
      return acc.bootOrder < disk.bootOrder ? acc : disk;
    });
  }

  // For InstanceType VMs with rootdisk, return rootdisk as boot disk
  if (hasRootDiskVolume) {
    return { name: ROOTDISK };
  }

  // Default to first disk if no explicit bootOrder
  return vmiDisks[0];
};
