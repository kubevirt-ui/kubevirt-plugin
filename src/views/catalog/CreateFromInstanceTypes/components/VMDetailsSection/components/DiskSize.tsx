import React, { FC } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import { DEFAULT_DISK_SIZE } from '@kubevirt-utils/components/DiskModal/utils/constants';
import { getVolumeSnapshotSize } from '@kubevirt-utils/resources/bootableresources/selectors';

const DiskSize: FC = () => {
  const { instanceTypeVMState, setCustomDiskSize } = useInstanceTypeVMStore();

  const { customDiskSize, pvcSource, volumeSnapshotSource } = instanceTypeVMState;

  const pvcDiskSize =
    pvcSource?.spec?.resources?.requests?.storage || getVolumeSnapshotSize(volumeSnapshotSource);
  const sizeData = pvcDiskSize || DEFAULT_DISK_SIZE;

  return <CapacityInput onChange={setCustomDiskSize} size={customDiskSize || sizeData} />;
};

export default DiskSize;
