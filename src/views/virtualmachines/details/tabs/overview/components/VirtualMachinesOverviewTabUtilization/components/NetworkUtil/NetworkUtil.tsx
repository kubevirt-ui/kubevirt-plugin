import React, { FC } from 'react';
import xbytes from 'xbytes';

import { V1VirtualMachineInstance } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import ComponentReady from '@kubevirt-utils/components/Charts/ComponentReady/ComponentReady';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import useVMQueries from '@kubevirt-utils/hooks/useVMQueries';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { PrometheusEndpoint } from '@openshift-console/dynamic-plugin-sdk';
import { Stack } from '@patternfly/react-core';
import { useFleetPrometheusPoll } from '@stolostron/multicluster-sdk';
import useDuration from '@virtualmachines/details/tabs/metrics/hooks/useDuration';

import { UtilizationBlock } from '../UtilizationBlock';

import NetworkBreakdownPopover from './NetworkBreakdownPopover';
import NetworkMetricsRow from './NetworkMetricsRow';

type NetworkUtilProps = {
  vmi: V1VirtualMachineInstance;
};

const NetworkUtil: FC<NetworkUtilProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const { currentTime } = useDuration();

  const queries = useVMQueries(vmi);

  const prometheusProps = {
    cluster: getCluster(vmi),
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace: getNamespace(vmi),
  };

  const [networkIn, networkInLoaded, networkInError] = useFleetPrometheusPoll({
    ...prometheusProps,
    query: queries?.NETWORK_IN_USAGE,
  });

  const [networkTotal] = useFleetPrometheusPoll({
    ...prometheusProps,
    query: queries?.NETWORK_TOTAL_BY_INTERFACE_USAGE,
  });

  const [networkOut, networkOutLoaded, networkOutError] = useFleetPrometheusPoll({
    ...prometheusProps,
    query: queries?.NETWORK_OUT_USAGE,
  });

  const loaded = networkInLoaded && networkOutLoaded;
  const isLoading = !loaded;
  const error = networkInError || networkOutError;

  const hasNetworkInData = !isEmpty(networkIn?.data?.result);
  const hasNetworkOutData = !isEmpty(networkOut?.data?.result);
  const networkInData = +(networkIn?.data?.result?.[0]?.value?.[1] ?? 0);
  const networkOutData = +(networkOut?.data?.result?.[0]?.value?.[1] ?? 0);
  const totalTransferred = xbytes(networkInData + networkOutData, {
    fixed: 0,
    iec: true,
  });
  const isReady = loaded && (hasNetworkInData || hasNetworkOutData);

  return (
    <UtilizationBlock
      dataTestId="util-summary-network-transfer"
      isNetworkUtil
      title={t('Network transfer')}
      usageValue={isReady ? `${totalTransferred}ps` : ''}
      usedOfTotalText={isReady ? t('Total') : ''}
    >
      <Stack className="pf-v6-u-pl-lg pf-v6-u-mt-xl" hasGutter>
        <ComponentReady error={error} isLoading={isLoading} isReady={isReady}>
          <div>
            <NetworkMetricsRow label={t('In')} value={networkInData} />
            <NetworkMetricsRow label={t('Out')} value={networkOutData} />
          </div>
        </ComponentReady>
        <NetworkBreakdownPopover networkTotal={networkTotal} vmi={vmi} />
      </Stack>
    </UtilizationBlock>
  );
};

export default NetworkUtil;
