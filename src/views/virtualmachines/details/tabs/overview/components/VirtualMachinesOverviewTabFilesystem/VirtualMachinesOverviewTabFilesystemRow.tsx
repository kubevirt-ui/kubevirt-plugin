import React, { FC } from 'react';

import { getHumanizedSize } from '@kubevirt-utils/utils/units';
import { TableData } from '@openshift-console/dynamic-plugin-sdk';

type VirtualMachinesOverviewTabFilesystemRowProps = {
  activeColumnIDs: Set<string>;
  obj: any;
};

const VirtualMachinesOverviewTabFilesystemRow: FC<VirtualMachinesOverviewTabFilesystemRowProps> = ({
  activeColumnIDs,
  obj,
}) => {
  const totalBytes = getHumanizedSize(String(obj?.totalBytes)).string;
  const usedBytes = getHumanizedSize(String(obj?.usedBytes)).string;
  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="diskName">
        {obj?.diskName}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="fileSystemType">
        {obj?.fileSystemType}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="mountPoint">
        {obj?.mountPoint}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="totalBytes">
        {totalBytes}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="usedBytes">
        {usedBytes}
      </TableData>
    </>
  );
};

export default VirtualMachinesOverviewTabFilesystemRow;
