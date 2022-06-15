import * as React from 'react';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { TableData } from '@openshift-console/dynamic-plugin-sdk';

const VirtualMachinesOverviewTabDisksRow = ({ obj, activeColumnIDs }) => {
  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        <div data-test-id={`disk-${obj?.name}`}>{obj?.name}</div>
      </TableData>
      <TableData id="drive" activeColumnIDs={activeColumnIDs}>
        <div data-test-id={`disk-${obj?.drive}`}>{obj?.drive || NO_DATA_DASH}</div>
      </TableData>
      <TableData id="size" activeColumnIDs={activeColumnIDs}>
        <div data-test-id={`disk-${obj?.size}`}>{readableSizeUnit(obj?.size) || NO_DATA_DASH}</div>
      </TableData>
    </>
  );
};

export default VirtualMachinesOverviewTabDisksRow;
