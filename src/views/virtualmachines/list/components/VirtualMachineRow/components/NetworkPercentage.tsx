import React, { FC } from 'react';
import xbytes from 'xbytes';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { VMQueries } from '@kubevirt-utils/components/Charts/utils/queries';
import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';
import { isRunning } from '@virtualmachines/utils';

type NetworkPercentageProps = {
  queries: Record<VMQueries, string>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const NetworkPercentage: FC<NetworkPercentageProps> = ({ queries, vm, vmi }) => {
  const { currentTime } = useDuration();

  const [networkIn] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace: vmi?.metadata?.namespace,
    query: queries?.NETWORK_IN_USAGE,
  });

  const [networkOut] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace: vmi?.metadata?.namespace,
    query: queries?.NETWORK_OUT_USAGE,
  });
  const networkOutData = +networkOut?.data?.result?.[0]?.value?.[1];
  const networkInData = +networkIn?.data?.result?.[0]?.value?.[1];

  const totalTransferred = xbytes(networkInData + networkOutData || 0, {
    fixed: 0,
    iec: true,
  });

  const hasValidData =
    (!isNaN(networkInData) && networkInData >= 0) ||
    (!isNaN(networkOutData) && networkOutData >= 0);
  if (!hasValidData || !isRunning(vm)) return <span>0 B/s</span>;

  return <div>{totalTransferred}/s</div>;
};

export default NetworkPercentage;
