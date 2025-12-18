import * as React from 'react';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { getHumanizedSize } from '@kubevirt-utils/utils/units';
import { TableData } from '@openshift-console/dynamic-plugin-sdk';
import { ResourceLink } from '@openshift-console/dynamic-plugin-sdk';

import { DiskPresentation } from '../../utils/virtualMachinesInstancePageDisksTabUtils';

type DiskTableRowProps = {
  activeColumnIDs: Set<string>;
  obj: DiskPresentation;
};

const DisksTableRow: React.FC<DiskTableRowProps> = ({ activeColumnIDs, obj }) => {
  const size = obj?.size && getHumanizedSize(obj.size).string;
  const defaultSize = obj?.size || NO_DATA_DASH;

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
