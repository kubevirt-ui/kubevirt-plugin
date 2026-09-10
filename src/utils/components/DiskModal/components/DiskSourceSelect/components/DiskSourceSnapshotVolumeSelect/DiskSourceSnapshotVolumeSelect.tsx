import type { FC } from 'react';
import React from 'react';

import DiskSourceSnapshotVolumeSelectName from './DiskSourceSnapshotVolumeSelectName';
import DiskSourceSnapshotVolumeSelectNamespace from './DiskSourceSnapshotVolumeSelectNamespace';

const DiskSourceSnapshotVolumeSelect: FC = () => {
  return (
    <>
      <DiskSourceSnapshotVolumeSelectNamespace />
      <DiskSourceSnapshotVolumeSelectName />
    </>
  );
};

export default DiskSourceSnapshotVolumeSelect;
