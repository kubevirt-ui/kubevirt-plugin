import produce from 'immer';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';

export const removeWindowsDrivers = (
  vm: V1VirtualMachine,
  windowsVolumeName: string,
): V1VirtualMachine => {
  return produce(vm, (draftVM) => {
    draftVM.spec.template.spec.domain.devices.disks =
      draftVM.spec.template.spec.domain.devices.disks.filter(
        (disk) => disk.name !== windowsVolumeName,
      );

    draftVM.spec.template.spec.volumes = draftVM.spec.template.spec.volumes.filter(
      (volume) => volume.name !== windowsVolumeName,
    );
  });
};
