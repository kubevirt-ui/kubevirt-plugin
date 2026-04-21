import React, { FC } from 'react';

import DiskSourcePVCSelectName from './DiskSourcePVCSelectName';
import DiskSourcePVCSelectNamespace from './DiskSourcePVCSelectNamespace';

type DiskSourcePVCSelectProps = {
  vmNamepace: string;
};

const DiskSourcePVCSelect: FC<DiskSourcePVCSelectProps> = ({ vmNamepace }) => {
  return (
    <>
      <DiskSourcePVCSelectNamespace vmNamespace={vmNamepace} />
      <DiskSourcePVCSelectName vmNamespace={vmNamepace} />
    </>
  );
};

export default DiskSourcePVCSelect;
