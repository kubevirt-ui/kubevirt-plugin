import * as React from 'react';

import { V1VirtualMachineInstanceGuestOSUser } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { fromNow } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

type ActiveUserListRowProps = RowProps<V1VirtualMachineInstanceGuestOSUser, { kind: string }>;

const ActiveUserListRow: React.FC<ActiveUserListRowProps> = ({ activeColumnIDs, obj }) => {
  const time = obj?.loginTime * 1000;
  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="userName">
        {obj?.userName || '-'}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="domain">
        {obj?.domain || '-'}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="loginTime">
        <Timestamp timestamp={time} />
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="elapsedTime">
        {fromNow(new Date(time), new Date())}
      </TableData>
    </>
  );
};

export default ActiveUserListRow;
