import * as React from 'react';

import { TableData } from '@openshift-console/dynamic-plugin-sdk';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import {
  convertBytes,
  DiskPresentation,
} from '../../utils/virtualMachinesInstancePageDisksTabUtils';

type DiskTableRowProps = {
  obj: DiskPresentation;
  activeColumnIDs: Set<string>;
};

const DisksTableRow: React.FC<DiskTableRowProps> = ({ obj, activeColumnIDs }) => {
  const convertedSize = convertBytes(Number(obj?.size));
  const size = obj?.size ? `${convertedSize.value} ${convertedSize.unit}` : '-';
  return (
    <>
      <TableData id="name" activeColumnIDs={activeColumnIDs}>
        {obj?.name}
      </TableData>
      <TableData id="source" activeColumnIDs={activeColumnIDs}>
        {obj?.namespace ? (
          <ResourceLink
            kind={'PersistentVolumeClaim'}
            name={obj?.name}
            namespace={obj?.namespace}
          />
        ) : (
          obj?.source
        )}
      </TableData>
      <TableData id="size" activeColumnIDs={activeColumnIDs}>
        {size}
      </TableData>
      <TableData id="drive" activeColumnIDs={activeColumnIDs}>
        {obj?.drive}
      </TableData>
      <TableData id="interface" activeColumnIDs={activeColumnIDs}>
        {obj?.interface}
      </TableData>
      <TableData id="storageClass" activeColumnIDs={activeColumnIDs}>
        {obj?.storageClass}
      </TableData>
    </>
  );
};

export default DisksTableRow;
