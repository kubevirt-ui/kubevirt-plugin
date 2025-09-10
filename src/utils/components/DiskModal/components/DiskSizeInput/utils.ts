import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import {
  getPVCSize,
  getPVCStorageCapacity,
} from '@kubevirt-utils/resources/bootableresources/selectors';
import { convertToBaseValue, humanizeBinaryBytesWithoutB } from '@kubevirt-utils/utils/humanize.js';
import { binaryUnitsOrdered } from '@kubevirt-utils/utils/unitConstants';
import { BinaryUnit } from '@kubevirt-utils/utils/unitConstants';
import { formatQuantityString } from '@kubevirt-utils/utils/units';

export const getMinSizes = (pvcSize: string) => {
  const pvcSizeBytes = convertToBaseValue(pvcSize);

  const minSizes: Record<BinaryUnit, number> = {} as Record<BinaryUnit, number>;

  binaryUnitsOrdered.forEach((unit) => {
    minSizes[unit] = humanizeBinaryBytesWithoutB(pvcSizeBytes, null, unit).value;
  });

  return minSizes;
};

export const getPVCStorageForInput = (pvc: IoK8sApiCoreV1PersistentVolumeClaim) => {
  const pvcStorageRequested = getPVCSize(pvc);
  if (!pvcStorageRequested) return null;

  const pvcStorageCapacity = getPVCStorageCapacity(pvc);

  return convertToBaseValue(pvcStorageCapacity) >= convertToBaseValue(pvcStorageRequested)
    ? pvcStorageCapacity
    : formatQuantityString(pvcStorageRequested, false);
};
