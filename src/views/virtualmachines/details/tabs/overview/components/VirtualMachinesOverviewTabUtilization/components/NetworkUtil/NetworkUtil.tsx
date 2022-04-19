import React from 'react';
import xbytes from 'xbytes';

import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk-internal';

import { getMultilineUtilizationQueries, PrometheusEndpoint } from '../../utils/queries';
import { adjustDurationForStart, getCreationTimestamp, sumOfValues } from '../../utils/utils';
import ComponentReady from '../ComponentReady/ComponentReady';

import NetworkThresholdChart from './NetworkThresholdChart';

type NetworkUtilProps = {
  duration: number;
  vmi: V1VirtualMachineInstance;
  vm: V1VirtualMachine;
};

const NetworkUtil: React.FC<NetworkUtilProps> = ({ duration, vmi, vm }) => {
  const { t } = useKubevirtTranslation();
  const createdAt = React.useMemo(() => getCreationTimestamp(vmi), [vmi]);

  const adjustDuration = React.useCallback(
    (start) => adjustDurationForStart(start, createdAt),
    [createdAt],
  );

  const queries = React.useMemo(
    () =>
      getMultilineUtilizationQueries({
        vmName: vm?.metadata?.name,
      }),
    [vm],
  );
  const timespan = React.useMemo(() => adjustDuration(duration), [adjustDuration, duration]);

  const [networkIn] = usePrometheusPoll({
    query: queries?.NETWORK_USAGE?.[0]?.query,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vm?.metadata?.namespace,
    timespan,
  });

  const [networkOut] = usePrometheusPoll({
    query: queries?.NETWORK_USAGE?.[1]?.query,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vm?.metadata?.namespace,
    timespan,
  });

  const networkInSum = sumOfValues(networkIn);
  const networkOutSum = sumOfValues(networkOut);

  const totalTransferred = xbytes(networkOutSum + networkInSum || 0, {
    iec: true,
    fixed: 0,
  });

  const networkInData = networkIn?.data?.result?.[0]?.values;
  const networkOutData = networkOut?.data?.result?.[0]?.values;
  const isReady =
    !isEmpty(networkInData) && !isEmpty(networkOutData) && !Number.isNaN(totalTransferred);

  return (
    <div className="util network">
      <div className="util-upper">
        <div className="util-title">
          {t('Network Transfer')}
          <div className="util-title__subtitle text-muted">{t('Primary Network')}</div>
        </div>
        <div className="util-summary">
          <div className="util-summary-value">{`${totalTransferred}s`}</div>
          <div className="util-summary-text text-muted network-value">
            <div>{t('Total')}</div>
          </div>
        </div>
      </div>
      <ComponentReady isReady={isReady}>
        <div className="network-metrics">
          <div className="network-metrics--row text-muted">
            <div className="network-metrics--row__sum">
              {`${xbytes(networkInSum || 0, {
                fixed: 0,
              })}s`}
            </div>
            <div className="network-metrics--row__title">{t('In')}</div>
          </div>
          <div className="network-metrics--row text-muted">
            <div className="network-metrics--row__sum">
              {`${xbytes(networkOutSum || 0, {
                fixed: 0,
              })}s`}
            </div>
            <div className="network-metrics--row__title">{t('Out')}</div>
          </div>
        </div>
        <NetworkThresholdChart networkIn={networkInData} networkOut={networkOutData} />
      </ComponentReady>
    </div>
  );
};

export default NetworkUtil;
