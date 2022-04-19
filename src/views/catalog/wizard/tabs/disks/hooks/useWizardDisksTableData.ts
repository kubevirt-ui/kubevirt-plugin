import * as React from 'react';

import { bytesFromQuantity } from '@catalog/utils/quantity';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getBootDisk, getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { DiskRawData, DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import {
  getPrintableDiskDrive,
  getPrintableDiskInterface,
} from '@kubevirt-utils/resources/vm/utils/disk/selectors';

type UseDisksTableDisks = (vm: V1VirtualMachine) => [DiskRowDataLayout[]];

/**
 * A Hook for getting disks data for a VM
 * @param vm - virtual machine to get disks from
 * @returns disks data and loading state
 */
const useWizardDisksTableData: UseDisksTableDisks = (vm: V1VirtualMachine) => {
  const { t } = useKubevirtTranslation();
  const vmDisks = getDisks(vm);
  const vmVolumes = getVolumes(vm);

  const disks = React.useMemo(() => {
    const diskDevices: DiskRawData[] = vmVolumes?.map((volume) => {
      const disk = vmDisks?.find(({ name }) => name === volume?.name);
      return { disk, volume };
    });

    return (diskDevices || []).map((device) => {
      const source = () => {
        if (device?.volume?.containerDisk) {
          return t('Container (Ephemeral)');
        }
        const sourceName = device?.pvc?.metadata?.name || t('Other');
        return sourceName;
      };
      const dataVolumeTemplate = vm?.spec?.dataVolumeTemplates?.find(
        (dvTemplate) => dvTemplate?.metadata.name === device?.volume?.dataVolume?.name,
      );

      const size =
        dataVolumeTemplate?.spec?.storage?.resources?.requests?.storage ||
        dataVolumeTemplate?.spec?.pvc?.resources?.requests?.storage;

      const storageClass =
        dataVolumeTemplate?.spec?.storage?.storageClassName ||
        dataVolumeTemplate?.spec?.pvc?.storageClassName ||
        '-';

      return {
        name: device?.disk?.name,
        source: source(),
        size: size ? bytesFromQuantity(size, 2).join('') : '-',
        storageClass,
        interface: getPrintableDiskInterface(device?.disk),
        drive: getPrintableDiskDrive(device?.disk),
        metadata: { name: device?.disk?.name },
        namespace: device?.pvc?.metadata?.namespace,
        isBootDisk: device?.disk?.name === getBootDisk(vm)?.name,
      };
    });
  }, [t, vm, vmDisks, vmVolumes]);

  return [disks || []];
};

export default useWizardDisksTableData;
