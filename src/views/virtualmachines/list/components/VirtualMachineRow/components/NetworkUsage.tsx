import React, { FC, memo } from 'react';
import xbytes from 'xbytes';

import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getVMMetrics } from '@virtualmachines/list/metrics';

type NetworkUsageProps = {
  vmName: string;
  vmNamespace: string;
};

const NetworkUsage: FC<NetworkUsageProps> = ({ vmName, vmNamespace }) => {
  const { networkUsage } = getVMMetrics(vmName, vmNamespace);
  if (isEmpty(networkUsage)) return <>{NO_DATA_DASH}</>;

  const totalTransferred = xbytes(networkUsage || 0, {
    fixed: 0,
    iec: true,
  });

  return <div>{totalTransferred}ps</div>;
};

export default memo(NetworkUsage);
