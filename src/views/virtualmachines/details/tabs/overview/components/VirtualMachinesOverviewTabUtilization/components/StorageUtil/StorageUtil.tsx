import React from 'react';
import xbytes from 'xbytes';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { useGuestOS } from '@kubevirt-utils/resources/vmi';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import { ChartDonutUtilization, ChartLabel } from '@patternfly/react-charts';

import { getMultilineUtilizationQueries, PrometheusEndpoint } from '../../utils/queries';
import { adjustDurationForStart, getCreationTimestamp } from '../../utils/utils';
import ComponentReady from '../ComponentReady/ComponentReady';

import StorageThresholdChart from './StorageThresholdChart';

type StorageUtilProps = {
  duration: number;
  vmi: V1VirtualMachineInstance;
  vm: V1VirtualMachine;
};

const StorageUtil: React.FC<StorageUtilProps> = ({ vmi, vm, duration }) => {
  const { t } = useKubevirtTranslation();

  const [guestAgentData, loaded] = useGuestOS(vmi);

  const { totalBytes = 0, usedBytes = 0 } =
    guestAgentData?.fsInfo?.disks?.reduce(
      (acc, data) => {
        acc.totalBytes += data?.totalBytes;
        acc.usedBytes += data?.usedBytes;
        return acc;
      },
      { totalBytes: 0, usedBytes: 0 },
    ) || {};

  const usedPercentage = (usedBytes / totalBytes) * 100 || 0;

  const createdAt = React.useMemo(() => getCreationTimestamp(vmi), [vmi]);
  const adjustDuration = React.useCallback(
    (start) => adjustDurationForStart(start, createdAt),
    [createdAt],
  );

  const queries = React.useMemo(
    () => getMultilineUtilizationQueries({ vmName: vm?.metadata?.name }),
    [vm],
  );

  const timespan = React.useMemo(() => adjustDuration(duration), [adjustDuration, duration]);

  const [data] = usePrometheusPoll({
    query: queries?.FILESYSTEM_USAGE?.[1]?.query,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vm?.metadata?.namespace,
    timespan,
  });

  const storageWriteData = data?.data?.result?.[0]?.values;
  const isReady = !Number.isNaN(usedPercentage) && !isEmpty(storageWriteData) && loaded;

  return (
    <div className="util">
      <div className="util-upper">
        <div className="util-title">{t('Storage')}</div>
        <div className="util-summary">
          <div className="util-summary-value">
            {xbytes(usedBytes || 0, { iec: true, fixed: 0 })}
          </div>
          <div className="util-summary-text text-muted">
            <div>{t('Used of ')}</div>
            <div>{xbytes(totalBytes || 0, { iec: true, fixed: 0 })}</div>
          </div>
        </div>
      </div>
      <div className="util-chart">
        <ComponentReady isReady={isReady}>
          <ChartDonutUtilization
            constrainToVisibleArea
            animate
            data={{
              x: t('Storage used'),
              y: usedPercentage,
            }}
            labels={({ datum }) =>
              datum.x ? `${datum.x}: ${xbytes(usedBytes || 0, { iec: true, fixed: 2 })}` : null
            }
            subTitle={t('Used')}
            subTitleComponent={<ChartLabel y={135} />}
            title={`${usedPercentage.toFixed(2) || 0}%`}
          />
          <StorageThresholdChart data={storageWriteData} threshold={totalBytes} />
        </ComponentReady>
      </div>
    </div>
  );
};

export default StorageUtil;
