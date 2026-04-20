import React, { FCC } from 'react';

import DiskSourceClonePVCSelectName from './DiskSourceClonePVCSelectName';
import DiskSourceClonePVCSelectNamespace from './DiskSourceClonePVCSelectNamespace';

const DiskSourceClonePVCSelect: FCC = () => {
  return (
    <>
      <DiskSourceClonePVCSelectNamespace />
      <DiskSourceClonePVCSelectName />
    </>
  );
};

export default DiskSourceClonePVCSelect;
