import * as React from 'react';

import { V1VirtualMachineInstanceGuestOSUser } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { fromNow } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import {
  MILI_SECONDS_TO_SECONDS_MULTIPLIYER,
  NO_DATA_DASH,
} from '@kubevirt-utils/resources/vm/utils/constants';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

type ActiveUserListRowProps = RowProps<V1VirtualMachineInstanceGuestOSUser, { kind: string }>;

const ActiveUserListRowVm: React.FC<ActiveUserListRowProps> = ({ obj, activeColumnIDs }) => {
  const time = obj?.loginTime * MILI_SECONDS_TO_SECONDS_MULTIPLIYER;
  return (
    <>
      <TableData id="userName" activeColumnIDs={activeColumnIDs}>
        {obj?.userName || NO_DATA_DASH}
      </TableData>
      <TableData id="domain" activeColumnIDs={activeColumnIDs}>
        {obj?.domain || NO_DATA_DASH}
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
