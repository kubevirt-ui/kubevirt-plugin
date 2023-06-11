import React, { FC, useMemo } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import ComponentReady from '@kubevirt-utils/components/Charts/ComponentReady/ComponentReady';
import { getUtilizationQueries } from '@kubevirt-utils/components/Charts/utils/queries';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { getVMIPod } from '@kubevirt-utils/resources/vmi';
import {
  K8sResourceCommon,
  PrometheusEndpoint,
  usePrometheusPoll,
} from '@openshift-console/dynamic-plugin-sdk';
import { ChartDonutUtilization, ChartLabel } from '@patternfly/react-charts';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

type CPUUtilProps = {
  pods: K8sResourceCommon[];
  vmi: V1VirtualMachineInstance;
};

const CPUUtil: FC<CPUUtilProps> = ({ pods, vmi }) => {
  const { t } = useKubevirtTranslation();
  const vmiPod = useMemo(() => getVMIPod(vmi, pods), [pods, vmi]);
  const { currentTime, duration } = useDuration();
  const queries = useMemo(
    () => getUtilizationQueries({ duration, launcherPodName: vmiPod?.metadata?.name, obj: vmi }),
    [vmi, vmiPod, duration],
  );

  const [dataCPURequested] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace: vmi?.metadata?.namespace,
    query: queries.CPU_REQUESTED,
  });

  const [dataCPUUsage] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace: vmi?.metadata?.namespace,
    query: queries?.CPU_USAGE,
  });

  const cpuUsage = +dataCPUUsage?.data?.result?.[0]?.value?.[1];
  const cpuRequested = +dataCPURequested?.data?.result?.[0]?.value?.[1];
  const averageCPUUsage = (cpuUsage / cpuRequested) * 100;
  const isReady = !Number.isNaN(cpuUsage) && !Number.isNaN(cpuRequested);

  return (
    <div className="util">
      <div className="util-upper">
        <div className="util-title">{t('CPU')}</div>
        <div className="util-summary" data-test-id="util-summary-cpu">
          <div className="util-summary-value">{`${isReady ? cpuUsage?.toFixed(2) : 0}s`}</div>
          <div className="util-summary-text text-muted">
            <div>{t('Requested of ')}</div>
            <div>{`${isReady ? cpuRequested?.toFixed(2) : 0}s`}</div>
          </div>
        </div>
      </div>
      <div className="util-chart">
        <ComponentReady isReady={isReady}>
          <ChartDonutUtilization
            data={{
              x: t('CPU used'),
              y: (averageCPUUsage > 100 ? 100 : averageCPUUsage) || 0,
            }}
            animate
            constrainToVisibleArea
            labels={({ datum }) => (datum.x ? `${datum.x}: ${(cpuUsage || 0)?.toFixed(2)}s` : null)}
            style={{ labels: { fontSize: 20 } }}
            subTitle={t('Used')}
            subTitleComponent={<ChartLabel y={135} />}
            title={`${averageCPUUsage.toFixed(2) || 0}%`}
          />
        </ComponentReady>
      </div>
    </div>
  );
};

export default CPUUtil;
