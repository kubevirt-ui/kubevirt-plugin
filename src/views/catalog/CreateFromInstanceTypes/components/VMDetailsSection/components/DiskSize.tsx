import React, { FC } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import { getVolumeSnapshotSize } from '@kubevirt-utils/resources/bootableresources/selectors';
import { convertToBaseValue, humanizeBinaryBytes } from '@kubevirt-utils/utils/humanize.js';

const DiskSize: FC = () => {
  const { instanceTypeVMState, setCustomDiskSize } = useInstanceTypeVMStore();

  const { customDiskSize, pvcSource, volumeSnapshotSource } = instanceTypeVMState;

  const pvcDiskSize =
    pvcSource?.spec?.resources?.requests?.storage || getVolumeSnapshotSize(volumeSnapshotSource);
  const sizeData = humanizeBinaryBytes(convertToBaseValue(pvcDiskSize)).string;

  if (!pvcDiskSize) return null;

  return <CapacityInput onChange={setCustomDiskSize} size={customDiskSize || sizeData} />;
};

export default DiskSize;
