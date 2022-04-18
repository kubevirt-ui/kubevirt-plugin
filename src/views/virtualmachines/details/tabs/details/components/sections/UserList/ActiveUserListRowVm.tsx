import * as React from 'react';

import { V1VirtualMachineInstanceGuestOSUser } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { fromNow } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

type ActiveUserListRowProps = RowProps<V1VirtualMachineInstanceGuestOSUser, { kind: string }>;

const ActiveUserListRowVm: React.FC<ActiveUserListRowProps> = ({ obj, activeColumnIDs }) => {
  const time = obj?.loginTime * 1000;
  return (
    <>
      <TableData id="userName" activeColumnIDs={activeColumnIDs}>
        {obj?.userName || '-'}
      </TableData>
      <TableData id="domain" activeColumnIDs={activeColumnIDs}>
        {obj?.domain || '-'}
      </TableData>
      <TableData id="loginTime" activeColumnIDs={activeColumnIDs}>
        <Timestamp timestamp={time} />
      </TableData>
      <TableData id="elapsedTime" activeColumnIDs={activeColumnIDs}>
        {fromNow(new Date(time), new Date())}
      </TableData>
    </>
  );
};

export default ActiveUserListRowVm;
