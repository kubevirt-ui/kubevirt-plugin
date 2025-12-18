import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1Volume } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getDisks, getVolumes } from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getPrintableDiskDrive } from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { convertToBaseValue, humanizeBinaryBytes } from '@kubevirt-utils/utils/humanize.js';
import { isEmpty } from '@kubevirt-utils/utils/utils';

import { SelectedMigration } from './constants';
import { getVolumePVC } from './utils';

export type MigrationDisksTableData = {
  drive: string;
  isSelectable: boolean;
  name: string;
  pvc: IoK8sApiCoreV1PersistentVolumeClaim;
  size: string;
  storageClass: string;
  vm: V1VirtualMachine;
};

const getDiskData = (
  vm: V1VirtualMachine,
  volume: V1Volume,
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[],
): MigrationDisksTableData => {
  const volumeDisk = getDisks(vm)?.find((disk) => disk.name === volume.name);
  const volumePVC = getVolumePVC(volume, pvcs);

  const pvcSize = humanizeBinaryBytes(
    convertToBaseValue(volumePVC?.spec?.resources?.requests?.storage),
  );

  return {
    drive: getPrintableDiskDrive(volumeDisk),
    isSelectable: !isEmpty(volumePVC),
    name: volume.name,
    pvc: volumePVC,
    size: pvcSize?.value === 0 ? NO_DATA_DASH : pvcSize?.string,
    storageClass: volumePVC?.spec?.storageClassName,
    vm,
  };
};

const getVMDiskdata = (
  vm: V1VirtualMachine,
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[],
): MigrationDisksTableData[] => getVolumes(vm)?.map((volume) => getDiskData(vm, volume, pvcs));

export const getTableDiskData = (
  vms: V1VirtualMachine[],
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[],
) => {
  if (isEmpty(vms)) {
    return [];
  }

  return vms
    .map((vm) =>
      getVMDiskdata(
        vm,
        pvcs?.filter((pvc) => getNamespace(pvc) === getNamespace(vm)),
      ),
    )
    .flat();
};

export const createSelectedMigration = (diskData: MigrationDisksTableData): SelectedMigration => ({
  pvc: diskData.pvc,
  vmName: getName(diskData.vm),
  vmNamespace: getNamespace(diskData.vm),
  volumeName: diskData.name,
});
