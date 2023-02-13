import { useEffect, useState } from 'react';
import produce from 'immer';

import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { DEFAULT_WINDOWS_DRIVERS_DISK_IMAGE } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { getDriversImage } from '@kubevirt-utils/resources/vm/utils/disk/drivers';

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

export const useDriversImage = (): [string, boolean] => {
  const [driversImage, setDriversImage] = useState<string>(DEFAULT_WINDOWS_DRIVERS_DISK_IMAGE);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getDriversImage().then((image) => {
      setDriversImage(image);
      setLoading(false);
    });
  }, []);

  return [driversImage, loading];
};
