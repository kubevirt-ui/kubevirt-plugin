import * as React from 'react';

import { V1VirtualMachineInstanceGuestOSUser } from '@kubevirt-ui/kubevirt-api/kubevirt';
import Timestamp from '@kubevirt-utils/components/Timestamp/Timestamp';
import { fromNow } from '@kubevirt-utils/components/Timestamp/utils/datetime';
import {
  NO_DATA_DASH,
  SECONDS_TO_MILLISECONDS_MULTIPLIER,
} from '@kubevirt-utils/resources/vm/utils/constants';
import { RowProps, TableData } from '@openshift-console/dynamic-plugin-sdk';

type ActiveUserListRowProps = RowProps<V1VirtualMachineInstanceGuestOSUser, { kind: string }>;

const ActiveUserListRowVm: React.FC<ActiveUserListRowProps> = ({ activeColumnIDs, obj }) => {
  const time = obj?.loginTime * SECONDS_TO_MILLISECONDS_MULTIPLIER;
  return (
    <>
      <TableData activeColumnIDs={activeColumnIDs} id="userName">
        {obj?.userName || NO_DATA_DASH}
      </TableData>
      <TableData activeColumnIDs={activeColumnIDs} id="domain">
        {obj?.domain || NO_DATA_DASH}
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

export default ActiveUserListRowVm;
