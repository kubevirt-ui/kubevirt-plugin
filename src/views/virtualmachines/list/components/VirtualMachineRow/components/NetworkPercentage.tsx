import React, { FC, useMemo } from 'react';
import xbytes from 'xbytes';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getUtilizationQueries } from '@kubevirt-utils/components/Charts/utils/queries';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';
import { isRunning } from '@virtualmachines/utils';

type NetworkPercentageProps = {
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const NetworkPercentage: FC<NetworkPercentageProps> = ({ vm, vmi }) => {
  const { currentTime, duration } = useDuration();
  const queries = useMemo(() => getUtilizationQueries({ duration, obj: vmi }), [vmi, duration]);
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
  const isReady = !isEmpty(networkInData) || !isEmpty(networkOutData);

  if (!isReady || !isRunning(vm)) return <span>0%</span>;

  return <div>{totalTransferred}ps</div>;
};

export default NetworkPercentage;
