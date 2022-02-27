import * as React from 'react';

import { TableData } from '@openshift-console/dynamic-plugin-sdk';

import { convertBytes } from '../../utils/virtualMachinesInstancePageDisksTabUtils';

type FileSystemTableRowProps = {
  obj: any;
  activeColumnIDs: Set<string>;
};

const FileSystemTableRow: React.FC<FileSystemTableRowProps> = ({ obj, activeColumnIDs }) => {
  const totalBytes = convertBytes(obj?.totalBytes);
  const usedBytes = convertBytes(obj?.usedBytes);

  return (
    <>
      <TableData id="diskName" activeColumnIDs={activeColumnIDs}>
        {obj?.diskName}
      </TableData>
      <TableData id="fileSystemType" activeColumnIDs={activeColumnIDs}>
        {obj?.fileSystemType}
      </TableData>
      <TableData id="mountPoint" activeColumnIDs={activeColumnIDs}>
        {obj?.mountPoint}
      </TableData>
      <TableData id="totalBytes" activeColumnIDs={activeColumnIDs}>
        {totalBytes.value} {totalBytes.unit}
      </TableData>
      <TableData id="usedBytes" activeColumnIDs={activeColumnIDs}>
        {usedBytes.value} {usedBytes.unit}
      </TableData>
    </>
  );
};

export default FileSystemTableRow;
