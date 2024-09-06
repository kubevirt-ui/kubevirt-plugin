import React, { FC } from 'react';

import DiskSourceDataSourceSelectName from './DiskSourceDataSourceSelectName';
import DiskSourceDataSourceSelectNamespace from './DiskSourceDataSourceSelectNamespace';

const DiskSourceDataSourceSelect: FC = () => {
  return (
    <>
      <DiskSourceDataSourceSelectNamespace />
      <DiskSourceDataSourceSelectName />
    </>
  );
};

export default DiskSourceDataSourceSelect;
