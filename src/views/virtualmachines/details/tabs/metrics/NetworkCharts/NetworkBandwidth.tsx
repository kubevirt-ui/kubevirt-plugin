import React, { useMemo } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import NetworkThresholdSingleSourceChart from '@kubevirt-utils/components/Charts/NetworkUtil/NetworkThresholdChartSingleSource';
import { getUtilizationQueries } from '@kubevirt-utils/components/Charts/utils/queries';
import {
  getPrometheusDataAllNics,
  getPrometheusDataByNic,
  queriesToLink,
} from '@kubevirt-utils/components/Charts/utils/utils';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';
import { Card, CardBody, CardTitle, GridItem } from '@patternfly/react-core';

import useDuration from '../hooks/useDuration';
import { ALL_NETWORKS } from '../utils/constants';

type NetworkBandwidthProps = {
  vmi: V1VirtualMachineInstance;
  nic: string;
};

const NetworkBandwidth: React.FC<NetworkBandwidthProps> = ({ vmi, nic }) => {
  const { t } = useKubevirtTranslation();

  const { currentTime, duration, timespan } = useDuration();
  const queries = useMemo(
    () => getUtilizationQueries({ obj: vmi, duration, nic }),
    [vmi, duration, nic],
  );
  const isAllNetwork = nic === ALL_NETWORKS;

  const [networkByNICTotal] = usePrometheusPoll({
    query: queries?.NETWORK_TOTAL_BY_INTERFACE_USAGE,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
    timespan,
  });

  const [networkTotal] = usePrometheusPoll({
    query: isAllNetwork && queries?.NETWORK_TOTAL_USAGE,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
    timespan,
  });

  const data = useMemo(
    () => [
      ...getPrometheusDataByNic(networkByNICTotal, nic),
      ...(isAllNetwork ? getPrometheusDataAllNics(networkTotal) : []),
    ],
    [networkByNICTotal, networkTotal, nic, isAllNetwork],
  );

  const link = isAllNetwork
    ? queriesToLink([queries?.NETWORK_TOTAL_BY_INTERFACE_USAGE, queries?.NETWORK_TOTAL_USAGE])
    : queriesToLink(queries?.NETWORK_TOTAL_USAGE);

  return (
    <GridItem span={4}>
      <Card>
        <CardTitle>{t('Network bandwidth')}</CardTitle>
        <CardBody>
          <NetworkThresholdSingleSourceChart data={data} link={link} />
        </CardBody>
      </Card>
    </GridItem>
  );
};

export default NetworkBandwidth;
