import * as React from 'react';

import { formatBytes } from '@kubevirt-utils/resources/vm/utils/disk/size';
import { TableData } from '@openshift-console/dynamic-plugin-sdk';

type FilesystemRowProps = {
  activeColumnIDs: Set<string>;
  obj: any;
};

const FilesystemRow: React.FC<FilesystemRowProps> = ({ activeColumnIDs, obj }) => {
  const totalBytes = formatBytes(String(obj?.totalBytes));
  const usedBytes = formatBytes(String(obj?.usedBytes));
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

export default FilesystemRow;
