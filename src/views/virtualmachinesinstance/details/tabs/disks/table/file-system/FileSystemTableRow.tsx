import * as React from 'react';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getHumanizedSize } from '@kubevirt-utils/utils/units';
import { TableData } from '@openshift-console/dynamic-plugin-sdk';

type FileSystemTableRowProps = {
  activeColumnIDs: Set<string>;
  obj: any;
};

const FileSystemTableRow: React.FC<FileSystemTableRowProps> = ({ activeColumnIDs, obj }) => {
  const totalBytes = obj?.totalBytes ? getHumanizedSize(obj.totalBytes).string : NO_DATA_DASH;
  const usedBytes = obj?.usedBytes ? getHumanizedSize(obj.usedBytes).string : NO_DATA_DASH;

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

export default FileSystemTableRow;
