import * as React from 'react';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { TableData } from '@openshift-console/dynamic-plugin-sdk';

const VirtualMachinesOverviewTabDisksRow = ({ obj, activeColumnIDs }) => {
  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        {obj?.name}
      </TableData>
      <TableData id="drive" activeColumnIDs={activeColumnIDs}>
        {obj?.drive || NO_DATA_DASH}
      </TableData>
      <TableData id="size" activeColumnIDs={activeColumnIDs}>
        {obj?.size || NO_DATA_DASH}
      </TableData>
    </>
  );
};

export default VirtualMachinesOverviewTabDisksRow;
