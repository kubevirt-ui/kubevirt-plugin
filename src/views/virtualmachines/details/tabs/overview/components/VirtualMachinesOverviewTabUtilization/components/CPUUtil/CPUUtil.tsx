import React from 'react';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMIPod } from '@kubevirt-utils/resources/vmi';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk-internal';
import { ChartDonutUtilization, ChartLabel } from '@patternfly/react-charts';

import { getUtilizationQueries, PrometheusEndpoint } from '../../utils/queries';
import { adjustDurationForStart, getCreationTimestamp, sumOfValues } from '../../utils/utils';

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

  const [dataCPUUsage, errorData, notLoaded] = usePrometheusPoll({
    query: queries?.CPU_USAGE,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vm?.metadata?.namespace,
    timespan,
  });

  const sumCPURequested = sumOfValues(dataCPURequested);
  const sumCPUUsage = sumOfValues(dataCPUUsage);
  const averageCPUUsage = Number(((sumCPUUsage / sumCPURequested) * 100).toFixed(2));

  return (
    <div className="util">
      <div className="util-upper">
        <div className="util-title">{t('CPU')}</div>
        <div className="util-summary">
          <div className="util-summary-value">{`${sumCPUUsage?.toFixed(2) || 0}s`}</div>
          <div className="util-summary-text text-muted">
            <div>{t('Requested of ')}</div>
            <div>{`${sumCPURequested?.toFixed(2) || 0}s`}</div>
          </div>
        </div>
      </div>
      <div className="util-chart">
        {!notLoaded && !errorData && !Number.isNaN(averageCPUUsage) && (
          <ChartDonutUtilization
            constrainToVisibleArea
            animate
            data={{
              x: t('CPU used'),
              y: averageCPUUsage || 0,
            }}
            labels={({ datum }) =>
              datum.x ? `${datum.x}: ${(sumCPUUsage || 0)?.toFixed(2)}s` : null
            }
            subTitle={t('Used')}
            subTitleComponent={<ChartLabel y={135} />}
            title={`${averageCPUUsage || 0}%`}
          />
        )}
      </div>
    </div>
  );
};

export default CPUUtil;
