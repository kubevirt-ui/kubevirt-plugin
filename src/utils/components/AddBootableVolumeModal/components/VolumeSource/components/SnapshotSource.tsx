import React, { FC } from 'react';

import {
  AddBootableVolumeState,
  SetBootableVolumeFieldType,
} from '@kubevirt-utils/components/AddBootableVolumeModal/utils/constants';
import SelectSnapshot from '@kubevirt-utils/components/SelectSnapshot/SelectSnapshot';

type SnapshotSourceProps = {
  bootableVolume: AddBootableVolumeState;
  setBootableVolumeField: SetBootableVolumeFieldType;
};

const SnapshotSource: FC<SnapshotSourceProps> = ({ bootableVolume, setBootableVolumeField }) => {
  const { bootableVolumeCluster, snapshotName, snapshotNamespace } = bootableVolume || {};
  return (
    <SelectSnapshot
      cluster={bootableVolumeCluster}
      selectSnapshotName={setBootableVolumeField('snapshotName')}
      selectSnapshotNamespace={setBootableVolumeField('snapshotNamespace')}
      setDiskSize={setBootableVolumeField('size')}
      snapshotNameSelected={snapshotName}
      snapshotNamespaceSelected={snapshotNamespace}
    />
  );
};

export default SnapshotSource;
