import * as React from 'react';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { TableData } from '@openshift-console/dynamic-plugin-sdk';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import {
  convertBytes,
  DiskPresentation,
} from '../../utils/virtualMachinesInstancePageDisksTabUtils';

type DiskTableRowProps = {
  activeColumnIDs: Set<string>;
  obj: DiskPresentation;
};

const DisksTableRow: React.FC<DiskTableRowProps> = ({ activeColumnIDs, obj }) => {
  const convertedSize = convertBytes(Number(obj?.size));
  const size = obj?.size && convertedSize?.unit && `${convertedSize.value} ${convertedSize.unit}`;
  const defaultSize = obj?.size || '-';
  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="name">
        {obj?.name}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="source">
        {obj?.namespace ? (
          <ResourceLink
            groupVersionKind={modelToGroupVersionKind(PersistentVolumeClaimModel)}
            name={obj?.name}
            namespace={obj?.namespace}
          />
        ) : (
          obj?.source
        )}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="size">
        {size || defaultSize}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="drive">
        {obj?.drive}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="interface">
        {obj?.interface}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="storageClass">
        {obj?.storageClass}
      </TableData>
    </>
  );
};

export default DisksTableRow;
