import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { V1VirtualMachine, V1Volume } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';
import { getDisks } from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getPrintableDiskDrive } from '@kubevirt-utils/resources/vm/utils/disk/selectors';
import { convertToBaseValue, humanizeBinaryBytes } from '@kubevirt-utils/utils/humanize.js';
import { isEmpty } from '@kubevirt-utils/utils/utils';

export const getTableDiskData = (
  vm: V1VirtualMachine,
  volume: V1Volume,
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[],
) => {
  const volumeDisk = getDisks(vm)?.find((disk) => disk.name === volume.name);
  const volumePVC = pvcs?.find(
    (pvc) =>
      getName(pvc) === volume.dataVolume?.name ||
      getName(pvc) === volume.persistentVolumeClaim?.claimName,
  );

  const pvcSize = humanizeBinaryBytes(
    convertToBaseValue(volumePVC?.spec?.resources?.requests?.storage),
  );

  return {
    drive: getPrintableDiskDrive(volumeDisk),
    isSelectable: !volumeDisk?.shareable && !isEmpty(volumePVC),
    name: volume.name,
    pvc: volumePVC,
    size: pvcSize?.value === 0 ? NO_DATA_DASH : pvcSize?.string,
    storageClass: volumePVC?.spec?.storageClassName,
  };
};
