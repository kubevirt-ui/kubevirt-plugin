import React, { FCC } from 'react';

import DiskSourceSnapshotVolumeSelectName from './DiskSourceSnapshotVolumeSelectName';
import DiskSourceSnapshotVolumeSelectNamespace from './DiskSourceSnapshotVolumeSelectNamespace';

const DiskSourceSnapshotVolumeSelect: FCC = () => {
  return (
    <>
      <DiskSourceSnapshotVolumeSelectNamespace />
      <DiskSourceSnapshotVolumeSelectName />
    </>
  );
};

export default DiskSourceSnapshotVolumeSelect;
