import * as React from 'react';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { TableData } from '@openshift-console/dynamic-plugin-sdk';

const VirtualMachinesOverviewTabDisksRow = ({ activeColumnIDs, obj }) => {
  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        <div data-test-id={`disk-${obj?.name}`}>{obj?.name}</div>
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="drive">
        <div data-test-id={`disk-${obj?.drive}`}>{obj?.drive || NO_DATA_DASH}</div>
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="size">
        <div data-test-id={`disk-${obj?.size}`}>{readableSizeUnit(obj?.size) || NO_DATA_DASH}</div>
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="interface">
        <div data-test-id={`disk-${obj?.interface}`}>{obj?.interface || NO_DATA_DASH}</div>
      </TableData>
    </>
  );
};

export default VirtualMachinesOverviewTabDisksRow;
