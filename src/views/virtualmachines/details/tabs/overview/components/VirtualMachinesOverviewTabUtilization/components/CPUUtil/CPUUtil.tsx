import React from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMIPod } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { K8sResourceCommon, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import { ChartDonutUtilization, ChartLabel } from '@patternfly/react-charts';

import { getUtilizationQueries, PrometheusEndpoint } from '../../utils/queries';
import { adjustDurationForStart, getCreationTimestamp, sumOfValues } from '../../utils/utils';
import ComponentReady from '../ComponentReady/ComponentReady';

import CPUThresholdChart from './CPUThresholdChart';

type CPUUtilProps = {
  duration: number;
  vmi: V1VirtualMachineInstance;
  vm: V1VirtualMachine;
  pods: K8sResourceCommon[];
};

const CPUUtil: React.FC<CPUUtilProps> = ({ duration, vmi, vm, pods }) => {
  const { t } = useKubevirtTranslation();
  const createdAt = React.useMemo(() => getCreationTimestamp(vmi), [vmi]);
  const vmiPod = React.useMemo(() => getVMIPod(vmi, pods), [pods, vmi]);

  const adjustDuration = React.useCallback(
    (start) => adjustDurationForStart(start, createdAt),
    [createdAt],
  );

  const queries = React.useMemo(
    () =>
      getUtilizationQueries({
        vmName: vm?.metadata?.name,
        launcherPodName: vmiPod?.metadata?.name,
      }),
    [vm, vmiPod],
  );
  const timespan = React.useMemo(() => adjustDuration(duration), [adjustDuration, duration]);

  const [dataCPURequested] = usePrometheusPoll({
    query: queries.CPU_REQUESTED,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vm?.metadata?.namespace,
    timespan,
  });

  const [dataCPUUsage] = usePrometheusPoll({
    query: queries?.CPU_USAGE,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vm?.metadata?.namespace,
    timespan,
  });

  const sumCPURequested = sumOfValues(dataCPURequested);
  const cpuUsage = dataCPUUsage?.data?.result?.[0]?.values;
  const cpuRequested = dataCPURequested?.data?.result?.[0]?.values;
  const sumCPUUsage = sumOfValues(dataCPUUsage);
  const averageCPUUsage = Number(((sumCPUUsage / sumCPURequested) * 100).toFixed(2));
  const isReady = !isEmpty(cpuUsage) && !isEmpty(cpuRequested) && !Number.isNaN(averageCPUUsage);

  return (
    <div className="util">
      <div className="util-upper">
        <div className="util-title">{t('CPU')}</div>
        <div className="util-summary" data-test-id="util-summary-cpu">
          <div className="util-summary-value">{`${sumCPUUsage?.toFixed(2) || 0}s`}</div>
          <div className="util-summary-text text-muted">
            <div>{t('Requested of ')}</div>
            <div>{`${sumCPURequested?.toFixed(2) || 0}s`}</div>
          </div>
        </div>
      </div>
      <div className="util-chart">
        <ComponentReady isReady={isReady}>
          <ChartDonutUtilization
            constrainToVisibleArea
            animate
            data={{
              x: t('CPU used'),
              y: (averageCPUUsage > 100 ? 100 : averageCPUUsage) || 0,
            }}
            labels={({ datum }) =>
              datum.x ? `${datum.x}: ${(sumCPUUsage || 0)?.toFixed(2)}s` : null
            }
            subTitle={t('Used')}
            subTitleComponent={<ChartLabel y={135} />}
            title={`${averageCPUUsage || 0}%`}
          />
          <CPUThresholdChart cpuUsage={cpuUsage} cpuRequested={cpuRequested} />
        </ComponentReady>
      </div>
    </div>
  );
};

export default CPUUtil;
