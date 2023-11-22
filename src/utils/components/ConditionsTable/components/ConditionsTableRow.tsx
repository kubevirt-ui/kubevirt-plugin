import * as React from 'react';

import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import { K8sResourceCondition } from '../ConditionsTable';

export const ConditionsTableRow: React.FC<RowProps<K8sResourceCondition>> = ({
  activeColumnIDs,
  obj,
}) => {
  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="type">
        {obj.type}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="status">
        {obj.status}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="updated">
        <Timestamp timestamp={obj.lastTransitionTime} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="reason">
        {obj.reason}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="message">
        {obj?.message}
      </TableData>
    </>
  );
};
