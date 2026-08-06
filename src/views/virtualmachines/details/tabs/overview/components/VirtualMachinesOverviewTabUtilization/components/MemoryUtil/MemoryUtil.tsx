import React, { type FC } from 'react';
import xbytes from 'xbytes';

import { type V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import SubTitleChartLabel from '@kubevirt-utils/components/Charts/ChartLabels/SubTitleChartLabel';
import TitleChartLabel from '@kubevirt-utils/components/Charts/ChartLabels/TitleChartLabel';
import ComponentReady from '@kubevirt-utils/components/Charts/ComponentReady/ComponentReady';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useVMQueries from '@kubevirt-utils/hooks/useVMQueries';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getMemory } from '@kubevirt-utils/resources/vm';
import { convertToBaseValue } from '@kubevirt-utils/utils/humanize.js';
import { readableSizeUnit } from '@kubevirt-utils/utils/units';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { PrometheusEndpoint } from '@openshift-console/dynamic-plugin-sdk';
import { ChartDonutUtilization } from '@patternfly/react-charts/victory';
import { useFleetPrometheusPoll } from '@stolostron/multicluster-sdk';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

import { UtilizationBlock } from '../UtilizationBlock';

type MemoryUtilProps = {
  vmi: V1VirtualMachineInstance;
};

const MemoryUtil: FC<MemoryUtilProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const { currentTime } = useDuration();

  const queries = useVMQueries(vmi);
  const memory = getMemory(vmi);

  const [data, loaded, error] = useFleetPrometheusPoll({
    cluster: getCluster(vmi),
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace: getNamespace(vmi),
    query: queries?.MEMORY_USAGE,
  });

  const isLoading = !loaded;
  const memoryUsed = +data?.data?.result?.[0]?.value?.[1];
  const memoryAvailableBytes = Number(convertToBaseValue(memory));
  const hasMemoryCapacity = Number.isFinite(memoryAvailableBytes) && memoryAvailableBytes > 0;
  const percentageMemoryUsed = hasMemoryCapacity ? (memoryUsed / memoryAvailableBytes) * 100 : NaN;
  const isReady =
    loaded && !isEmpty(memory) && hasMemoryCapacity && Number.isFinite(percentageMemoryUsed);

  return (
    <UtilizationBlock
      dataTestId="util-summary-memory"
      title={t('Memory')}
      usageValue={isReady ? xbytes(memoryUsed || 0, { fixed: 0, iec: true }) : ''}
      usedOfTotalText={isReady ? t('Used of {{ total }}', { total: readableSizeUnit(memory) }) : ''}
    >
      <ComponentReady error={error} isLoading={isLoading} isReady={isReady}>
        <ChartDonutUtilization
          animate
          constrainToVisibleArea
          data={{
            x: t('Memory used'),
            y: Number(percentageMemoryUsed?.toFixed(2)),
          }}
          labels={({ datum }) =>
            datum.x ? `${datum.x}: ${xbytes(memoryUsed || 0, { iec: true })}` : null
          }
          style={{ labels: { fontSize: 20 } }}
          subTitle={t('Used')}
          subTitleComponent={<SubTitleChartLabel y={135} />}
          title={`${Number(percentageMemoryUsed?.toFixed(2))}%`}
          titleComponent={<TitleChartLabel />}
        />
      </ComponentReady>
    </UtilizationBlock>
  );
};

export default MemoryUtil;
