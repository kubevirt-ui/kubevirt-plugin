import React, { FC } from 'react';
import xbytes from 'xbytes';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getNetworkUsagePercentage } from '@virtualmachines/list/metrics';

type NetworkUsageProps = {
  vmName: string;
  vmNamespace: string;
};

const NetworkUsage: FC<NetworkUsageProps> = ({ vmName, vmNamespace }) => {
  const totalTransferred = getNetworkUsagePercentage(vmName, vmNamespace);
  if (isEmpty(totalTransferred)) return <>{NO_DATA_DASH}</>;

  const formattedUsage = xbytes(totalTransferred || 0, {
    fixed: 0,
    iec: true,
  });
  return <div>{formattedUsage}ps</div>;
};

export default NetworkUsage;
