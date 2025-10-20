import React from 'react';
import xbytes from 'xbytes';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
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

const NetworkUtil: React.FC<NetworkUtilProps> = ({ vmi }) => {
  const { t } = useKubevirtTranslation();
  const { currentTime } = useDuration();

  const queries = useVMQueries(vmi);

  const prometheusProps = {
    cluster: getCluster(vmi),
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace: getNamespace(vmi),
  };

  const [networkIn] = useFleetPrometheusPoll({
    ...prometheusProps,
    query: queries?.NETWORK_IN_USAGE,
  });

  const [networkTotal] = useFleetPrometheusPoll({
    ...prometheusProps,
    query: queries?.NETWORK_TOTAL_BY_INTERFACE_USAGE,
  });

  const [networkOut] = useFleetPrometheusPoll({
    ...prometheusProps,
    query: queries?.NETWORK_OUT_USAGE,
  });

  const networkInterfaceTotal = Number(networkTotal?.data?.result?.[0]?.value?.[1])?.toFixed(2);
  const networkInData = +networkIn?.data?.result?.[0]?.value?.[1];
  const networkOutData = +networkOut?.data?.result?.[0]?.value?.[1];
  const totalTransferred = xbytes(networkInData + networkOutData || 0, {
    fixed: 0,
    iec: true,
  });
  const isReady = !isEmpty(networkInData) || !isEmpty(networkOutData);

  return (
    <UtilizationBlock
      dataTestId="util-summary-network-transfer"
      isNetworkUtil
      title={t('Network transfer')}
      usageValue={`${totalTransferred}ps`}
      usedOfTotalText={t('Total')}
    >
      <Stack className="pf-v6-u-pl-lg pf-v6-u-mt-xl" hasGutter>
        <ComponentReady isReady={isReady}>
          <div>
            <NetworkMetricsRow label={t('In')} value={networkInData} />
            <NetworkMetricsRow label={t('Out')} value={networkOutData} />
          </div>
        </ComponentReady>
        <NetworkBreakdownPopover
          networkInterfaceTotal={networkInterfaceTotal}
          networkTotal={networkTotal}
          vmi={vmi}
        />
      </Stack>
    </UtilizationBlock>
  );
};

export default NetworkUtil;
