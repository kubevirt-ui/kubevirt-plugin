import * as React from 'react';

import { formatBytes } from '@kubevirt-utils/resources/vm/utils/disk/size';
import { TableData } from '@openshift-console/dynamic-plugin-sdk';

type FilesystemRowProps = {
  obj: any;
  activeColumnIDs: Set<string>;
};

const FilesystemRow: React.FC<FilesystemRowProps> = ({ obj, activeColumnIDs }) => {
  const totalBytes = formatBytes(String(obj?.totalBytes));
  const usedBytes = formatBytes(String(obj?.usedBytes));
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
        {totalBytes}
      </TableData>
      <TableData id="usedBytes" activeColumnIDs={activeColumnIDs}>
        {usedBytes}
      </TableData>
    </>
  );
};

export default FilesystemRow;
