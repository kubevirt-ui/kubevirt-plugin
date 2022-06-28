import * as React from 'react';

import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

import { K8sResourceCondition } from '../ConditionsTable';

export const ConditionsTableRow: React.FC<RowProps<K8sResourceCondition>> = ({
  obj,
  activeColumnIDs,
}) => {
  return (
    <>
      <TableData id="type" activeColumnIDs={activeColumnIDs}>
        {obj.type}
      </TableData>
      <TableData id="status" activeColumnIDs={activeColumnIDs}>
        {obj.status}
      </TableData>
      <TableData id="updated" activeColumnIDs={activeColumnIDs}>
        <Timestamp timestamp={obj.lastTransitionTime} />
      </TableData>
      <TableData id="reason" activeColumnIDs={activeColumnIDs}>
        {obj.reason}
      </TableData>
      <TableData id="message" activeColumnIDs={activeColumnIDs}>
        {obj?.message}
      </TableData>
    </>
  );
};
