import React, { FC } from 'react';
import xbytes from 'xbytes';

import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getNetworkUsagePercentage } from '@virtualmachines/list/metrics';
import { isRunning } from '@virtualmachines/utils';

type NetworkUsageProps = {
  vm: V1VirtualMachine;
};

const NetworkUsage: FC<NetworkUsageProps> = ({ vm }) => {
  const totalTransferred = getNetworkUsagePercentage(vm);

  if (isEmpty(totalTransferred) || !isRunning(vm)) return <>{NO_DATA_DASH}</>;

  const formattedUsage = xbytes(totalTransferred || 0, {
    fixed: 0,
    iec: true,
  });
  return <div>{formattedUsage}ps</div>;
};

export default NetworkUsage;
