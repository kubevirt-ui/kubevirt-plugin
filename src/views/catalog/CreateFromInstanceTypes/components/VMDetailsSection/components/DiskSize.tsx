import React, { FC } from 'react';

import { useInstanceTypeVMStore } from '@catalog/CreateFromInstanceTypes/state/useInstanceTypeVMStore';
import { getDiskSize } from '@catalog/CreateFromInstanceTypes/utils/utils';
import CapacityInput from '@kubevirt-utils/components/CapacityInput/CapacityInput';
import { DEFAULT_DISK_SIZE } from '@kubevirt-utils/components/DiskModal/utils/constants';

const DiskSize: FC = () => {
  const { instanceTypeVMState, setCustomDiskSize } = useInstanceTypeVMStore();

  const { customDiskSize, dvSource, pvcSource, volumeSnapshotSource } = instanceTypeVMState;

  const pvcDiskSize = getDiskSize(dvSource, pvcSource, volumeSnapshotSource);

  return (
    <CapacityInput
      onChange={setCustomDiskSize}
      size={customDiskSize || pvcDiskSize || DEFAULT_DISK_SIZE}
    />
  );
};

export default DiskSize;
