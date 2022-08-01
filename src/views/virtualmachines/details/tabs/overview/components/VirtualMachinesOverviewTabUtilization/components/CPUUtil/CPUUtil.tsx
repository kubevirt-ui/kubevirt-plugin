import React from 'react';

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
  vmi: V1VirtualMachineInstance;
  pods: K8sResourceCommon[];
};

const CPUUtil: React.FC<CPUUtilProps> = ({ vmi, pods }) => {
  const { t } = useKubevirtTranslation();
  const vmiPod = React.useMemo(() => getVMIPod(vmi, pods), [pods, vmi]);
  const { currentTime, duration } = useDuration();
  const queries = React.useMemo(
    () => getUtilizationQueries({ obj: vmi, duration, launcherPodName: vmiPod?.metadata?.name }),
    [vmi, vmiPod, duration],
  );

  const [dataCPURequested] = usePrometheusPoll({
    query: queries.CPU_REQUESTED,
    endpoint: PrometheusEndpoint?.QUERY,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
  });

  const [dataCPUUsage] = usePrometheusPoll({
    query: queries?.CPU_USAGE,
    endpoint: PrometheusEndpoint?.QUERY,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
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
            constrainToVisibleArea
            animate
            data={{
              x: t('CPU used'),
              y: (averageCPUUsage > 100 ? 100 : averageCPUUsage) || 0,
            }}
            labels={({ datum }) => (datum.x ? `${datum.x}: ${(cpuUsage || 0)?.toFixed(2)}s` : null)}
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
