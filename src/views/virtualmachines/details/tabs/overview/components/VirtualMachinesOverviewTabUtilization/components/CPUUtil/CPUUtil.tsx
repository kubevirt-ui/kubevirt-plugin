import React, { FC } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import SubTitleChartLabel from '@kubevirt-utils/components/Charts/ChartLabels/SubTitleChartLabel';
import TitleChartLabel from '@kubevirt-utils/components/Charts/ChartLabels/TitleChartLabel';
import ComponentReady from '@kubevirt-utils/components/Charts/ComponentReady/ComponentReady';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useVMQueries from '@kubevirt-utils/hooks/useVMQueries';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getCPU, getVCPUCount } from '@kubevirt-utils/resources/vm';
import { humanizeCpuCores } from '@kubevirt-utils/utils/humanize.js';
import { getCluster } from '@multicluster/helpers/selectors';
import { PrometheusEndpoint } from '@openshift-console/dynamic-plugin-sdk';
import { ChartDonutUtilization } from '@patternfly/react-charts/victory';
import { useFleetPrometheusPoll } from '@stolostron/multicluster-sdk';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

import { UtilizationBlock } from '../UtilizationBlock';

type CPUUtilProps = {
  vmi: V1VirtualMachineInstance;
};

const CPUUtil: FC<CPUUtilProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const { currentTime } = useDuration();

  const queries = useVMQueries(vmi);

  const prometheusProps = {
    cluster: getCluster(vmi),
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace: getNamespace(vmi),
  };

  const [dataCPUUsage] = useFleetPrometheusPoll({
    ...prometheusProps,
    query: queries?.CPU_USAGE,
  });

  const vmCPU = getCPU(vmi);

  const cpuUsage = +(dataCPUUsage?.data?.result?.[0]?.value?.[1] || 0);
  const cpuUsageHumanized = humanizeCpuCores(cpuUsage);

  const cpuRequested = getVCPUCount(vmCPU);
  const cpuRequestedHumanized = humanizeCpuCores(cpuRequested);

  const averageCPUUsageStr = ((cpuUsage / cpuRequested) * 100).toFixed(2) || 0;
  const averageCPUUsage = Number(averageCPUUsageStr);

  const isReady = !Number.isNaN(cpuUsage) && !Number.isNaN(cpuRequested);

  return (
    <UtilizationBlock
      usedOfTotalText={t('Requested of {{cpuRequested}}', {
        cpuRequested: isReady ? cpuRequestedHumanized?.string : 0,
      })}
      dataTestId="util-summary-cpu"
      title={t('CPU')}
      usageValue={`${isReady ? cpuUsageHumanized?.string : 0}`}
    >
      <ComponentReady isReady={isReady}>
        <ChartDonutUtilization
          data={{
            x: t('CPU used'),
            y: (averageCPUUsage > 100 ? 100 : averageCPUUsage) || 0,
          }}
          animate
          constrainToVisibleArea
          labels={({ datum }) => (datum.x ? `${datum.x}: ${cpuUsageHumanized?.string}` : null)}
          style={{ labels: { fontSize: 20 } }}
          subTitle={t('Used')}
          subTitleComponent={<SubTitleChartLabel y={135} />}
          title={`${averageCPUUsageStr}%`}
          titleComponent={<TitleChartLabel />}
        />
      </ComponentReady>
    </UtilizationBlock>
  );
};

export default CPUUtil;
