import { useMemo } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getUtilizationQueries } from '@kubevirt-utils/components/Charts/utils/queries';
import { getPrometheusData, queriesToLink } from '@kubevirt-utils/components/Charts/utils/utils';
import {
  PrometheusEndpoint,
  PrometheusValue,
  usePrometheusPoll,
} from '@openshift-console/dynamic-plugin-sdk';

import useDuration from '../../hooks/useDuration';

type UseNetworkData = (
  vmi: V1VirtualMachineInstance,
  nic: string,
) => [
  networkTotal: PrometheusValue[],
  NetworkIn: PrometheusValue[],
  NetworkOut: PrometheusValue[],
  links: { [key: string]: string },
];

const useNetworkData: UseNetworkData = (vmi, nic) => {
  const { currentTime, duration, timespan } = useDuration();
  const queries = useMemo(
    () => getUtilizationQueries({ obj: vmi, duration, nic }),
    [vmi, duration, nic],
  );

  const [networkTotal] = usePrometheusPoll({
    query: queries?.NETWORK_TOTAL_USAGE,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
    timespan,
  });

  const [networkIn] = usePrometheusPoll({
    query: queries?.NETWORK_IN_BY_INTERFACE_USAGE,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
    timespan,
  });

  const [networkOut] = usePrometheusPoll({
    query: queries?.NETWORK_OUT_BY_INTERFACE_USAGE,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
    timespan,
  });

  return [
    getPrometheusData(networkTotal),
    getPrometheusData(networkIn),
    getPrometheusData(networkOut),
    {
      in: queriesToLink(queries?.NETWORK_IN_BY_INTERFACE_USAGE),
      out: queriesToLink(queries?.NETWORK_OUT_BY_INTERFACE_USAGE),
      total: queriesToLink(queries?.NETWORK_TOTAL_USAGE),
    },
  ];
};

export default useNetworkData;
