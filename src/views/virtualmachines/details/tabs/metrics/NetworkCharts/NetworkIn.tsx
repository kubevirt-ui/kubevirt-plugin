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

type NetworkInProps = {
  vmi: V1VirtualMachineInstance;
  nic: string;
};

const NetworkIn: React.FC<NetworkInProps> = ({ vmi, nic }) => {
  const { t } = useKubevirtTranslation();

  const { currentTime, duration, timespan } = useDuration();
  const queries = useMemo(
    () => getUtilizationQueries({ obj: vmi, duration, nic }),
    [vmi, duration, nic],
  );
  const isAllNetwork = nic === ALL_NETWORKS;

  const [networkByNICIn] = usePrometheusPoll({
    query: queries?.NETWORK_IN_BY_INTERFACE_USAGE,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
    timespan,
  });

  const [networkIn] = usePrometheusPoll({
    query: isAllNetwork && queries?.NETWORK_IN_USAGE,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
    timespan,
  });

  const data = useMemo(
    () => [
      ...getPrometheusDataByNic(networkByNICIn, nic),
      ...(isAllNetwork ? getPrometheusDataAllNics(networkIn) : []),
    ],
    [networkByNICIn, networkIn, nic, isAllNetwork],
  );

  const link = isAllNetwork
    ? queriesToLink([queries?.NETWORK_IN_BY_INTERFACE_USAGE, queries?.NETWORK_IN_USAGE])
    : queriesToLink(queries?.NETWORK_IN_USAGE);

  return (
    <GridItem span={4}>
      <Card>
        <CardTitle>{t('Network in')}</CardTitle>
        <CardBody>
          <NetworkThresholdSingleSourceChart data={data} link={link} />
        </CardBody>
      </Card>
    </GridItem>
  );
};

export default NetworkIn;
