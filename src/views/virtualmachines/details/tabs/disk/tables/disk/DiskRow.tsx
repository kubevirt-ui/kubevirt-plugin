import * as React from 'react';

import { PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { DiskRowDataLayout } from '@kubevirt-utils/resources/vm/utils/disk/constants';
import { ResourceLink, RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

const DiskRow: React.FC<RowProps<DiskRowDataLayout>> = ({ obj, activeColumnIDs }) => {
  const isPVCSource = !['Container (Ephemeral)', 'Other'].includes(obj?.source);
  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        {obj?.name}
      </TableData>
      <TableData id="source" activeColumnIDs={activeColumnIDs}>
        {isPVCSource ? (
          <ResourceLink kind={PersistentVolumeClaimModel.kind} name={obj?.source} />
        ) : (
          obj?.source
        )}
      </TableData>
      <TableData id="size" activeColumnIDs={activeColumnIDs}>
        {obj?.size}
      </TableData>
      <TableData id="drive" activeColumnIDs={activeColumnIDs}>
        {obj?.drive}
      </TableData>
      <TableData id="interface" activeColumnIDs={activeColumnIDs}>
        {obj?.interface}
      </TableData>
      <TableData id="storage-class" activeColumnIDs={activeColumnIDs}>
        {obj?.storageClass}
      </TableData>
      <TableData
        id="actions"
        activeColumnIDs={activeColumnIDs}
        className="dropdown-kebab-pf pf-c-table__action"
      >
        ...
      </TableData>
    </>
  );
};

export default DiskRow;
