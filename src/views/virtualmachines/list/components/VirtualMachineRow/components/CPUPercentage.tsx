import React, { FC } from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { VMQueries } from '@kubevirt-utils/components/Charts/utils/queries';
import { getCPU, getVCPUCount } from '@kubevirt-utils/resources/vm';
import { NO_DATA_DASH } from '@kubevirt-utils/resources/vm/utils/constants';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';
import { isRunning } from '@virtualmachines/utils';

type CPUPercentageProps = {
  queries: Record<VMQueries, string>;
  vm: V1VirtualMachine;
  vmi?: V1VirtualMachineInstance;
};

const CPUPercentage: FC<CPUPercentageProps> = ({ queries, vm, vmi }) => {
  const { currentTime } = useDuration();

  const [dataCPUUsage] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace: vmi?.metadata?.namespace,
    query: queries?.CPU_USAGE,
  });
  const vmCPU = getCPU(vmi);

  const cpuUsage = +(dataCPUUsage?.data?.result?.[0]?.value?.[1] || 0);
  const cpuRequested = getVCPUCount(vmCPU);

  const averageCPUUsageStr =
    cpuRequested !== 0 ? ((cpuUsage / cpuRequested) * 100).toFixed(2) || 0 : 0;
  const averageCPUUsage = Number(averageCPUUsageStr);

  if (isEmpty(dataCPUUsage) || !isRunning(vm)) return <span>{NO_DATA_DASH}</span>;

  return <span>{averageCPUUsage}%</span>;
};

export default CPUPercentage;
