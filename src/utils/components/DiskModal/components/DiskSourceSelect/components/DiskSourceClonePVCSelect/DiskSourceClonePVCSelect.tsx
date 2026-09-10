import type { FC } from 'react';
import React from 'react';

import DiskSourceClonePVCSelectName from './DiskSourceClonePVCSelectName';
import DiskSourceClonePVCSelectNamespace from './DiskSourceClonePVCSelectNamespace';

const DiskSourceClonePVCSelect: FC = () => {
  return (
    <>
      <DiskSourceClonePVCSelectNamespace />
      <DiskSourceClonePVCSelectName />
    </>
  );
};

export default DiskSourceClonePVCSelect;
