import * as React from 'react';

import { TableData } from '@openshift-console/dynamic-plugin-sdk';

import { convertBytes } from '../../utils/virtualMachinesInstancePageDisksTabUtils';

type FileSystemTableRowProps = {
  activeColumnIDs: Set<string>;
  obj: any;
};

const FileSystemTableRow: React.FC<FileSystemTableRowProps> = ({ activeColumnIDs, obj }) => {
  const totalBytes = convertBytes(obj?.totalBytes);
  const usedBytes = convertBytes(obj?.usedBytes);

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
        {totalBytes.value} {totalBytes.unit}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="usedBytes">
        {usedBytes.value} {usedBytes.unit}
      </TableData>
    </>
  );
};

export default FileSystemTableRow;
