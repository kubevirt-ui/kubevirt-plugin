import React, { FC } from 'react';

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
