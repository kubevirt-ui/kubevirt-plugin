import React from 'react';
import xbytes from 'xbytes';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getMemorySize } from '@kubevirt-utils/components/CPUMemoryModal/utils/CpuMemoryUtils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import { ChartDonutUtilization, ChartLabel } from '@patternfly/react-charts';

import { getUtilizationQueries, PrometheusEndpoint } from '../../utils/queries';
import { adjustDurationForStart, getCreationTimestamp, sumOfValues } from '../../utils/utils';
import ComponentReady from '../ComponentReady/ComponentReady';

import MemoryThresholdChart from './MemoryThresholdChart';

type MemoryUtilProps = {
  duration: number;
  vmi: V1VirtualMachineInstance;
  vm: V1VirtualMachine;
};

const MemoryUtil: React.FC<MemoryUtilProps> = ({ duration, vmi, vm }) => {
  const { t } = useKubevirtTranslation();
  const createdAt = React.useMemo(() => getCreationTimestamp(vmi), [vmi]);
  const adjustDuration = React.useCallback(
    (start) => adjustDurationForStart(start, createdAt),
    [createdAt],
  );
  const queries = React.useMemo(() => getUtilizationQueries({ vmName: vm?.metadata?.name }), [vm]);
  const timespan = React.useMemo(() => adjustDuration(duration), [adjustDuration, duration]);

  const requests = vm?.spec?.template?.spec?.domain?.resources?.requests as {
    [key: string]: string;
  };
  const memory = getMemorySize(requests?.memory);

  const [data] = usePrometheusPoll({
    query: queries?.MEMORY_USAGE,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vm?.metadata?.namespace,
    timespan,
  });

  const prometheusMemoryData = data?.data?.result?.[0]?.values;

  const averageUsedMemory = sumOfValues(data);

  const memoryUsed = averageUsedMemory / prometheusMemoryData?.length;
  const memoryAvilableBytes = xbytes.parseSize(`${memory?.size} ${memory?.unit}B`);
  const value = (memoryUsed / memoryAvilableBytes) * 100;
  const isReady = !isEmpty(prometheusMemoryData) && !isEmpty(memory) && !Number.isNaN(value);

  return (
    <div className="util">
      <div className="util-upper">
        <div className="util-title">{t('Memory')}</div>
        <div className="util-summary" data-test-id="util-summary-memory">
          <div className="util-summary-value">
            {xbytes(memoryUsed || 0, { iec: true, fixed: 0 })}
          </div>
          <div className="util-summary-text text-muted">
            <div>{t('Used of ')}</div>
            <div>{`${memory?.size} ${memory?.unit}B`}</div>
          </div>
        </div>
      </div>
      <div className="util-chart">
        <ComponentReady isReady={isReady}>
          <ChartDonutUtilization
            constrainToVisibleArea
            animate
            data={{
              x: t('Memory used'),
              y: Number(value?.toFixed(2)),
            }}
            labels={({ datum }) =>
              datum.x ? `${datum.x}: ${xbytes(memoryUsed || 0, { iec: true })}` : null
            }
            subTitle={t('Used')}
            subTitleComponent={<ChartLabel y={135} />}
            title={`${Number(value?.toFixed(2))}%`}
          />
          <MemoryThresholdChart threshold={memoryAvilableBytes} data={prometheusMemoryData} />
        </ComponentReady>
      </div>
    </div>
  );
};

export default MemoryUtil;
