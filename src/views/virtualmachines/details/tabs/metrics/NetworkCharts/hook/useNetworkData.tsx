import { useMemo } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getUtilizationQueries } from '@kubevirt-utils/components/Charts/utils/queries';
import {
  getPrometheusDataAllNics,
  getPrometheusDataByNic,
  queriesToLink,
} from '@kubevirt-utils/components/Charts/utils/utils';
import {
  PrometheusEndpoint,
  PrometheusResult,
  usePrometheusPoll,
} from '@openshift-console/dynamic-plugin-sdk';

import useDuration from '../../hooks/useDuration';
import { ALL_NETWORKS } from '../../utils/constants';

type UseNetworkData = (
  vmi: V1VirtualMachineInstance,
  nic: string,
) => {
  data: {
    total: PrometheusResult[];
    in: PrometheusResult[];
    out: PrometheusResult[];
  };
  links: { [key: string]: string };
};

const useNetworkData: UseNetworkData = (vmi, nic) => {
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
  const [networkByNICIn] = usePrometheusPoll({
    query: queries?.NETWORK_IN_BY_INTERFACE_USAGE,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
    timespan,
  });
  const [networkByNICOut] = usePrometheusPoll({
    query: queries?.NETWORK_OUT_BY_INTERFACE_USAGE,
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

  const [networkIn] = usePrometheusPoll({
    query: isAllNetwork && queries?.NETWORK_IN_USAGE,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
    timespan,
  });

  const [networkOut] = usePrometheusPoll({
    query: isAllNetwork && queries?.NETWORK_OUT_USAGE,
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    namespace: vmi?.metadata?.namespace,
    endTime: currentTime,
    timespan,
  });
  return {
    data: {
      total: [
        ...getPrometheusDataByNic(networkByNICTotal, nic),
        ...(isAllNetwork ? getPrometheusDataAllNics(networkTotal) : []),
      ],
      in: [
        ...getPrometheusDataByNic(networkByNICIn, nic),
        ...(isAllNetwork ? getPrometheusDataAllNics(networkIn) : []),
      ],
      out: [
        ...getPrometheusDataByNic(networkByNICOut, nic),
        ...(isAllNetwork ? getPrometheusDataAllNics(networkOut) : []),
      ],
    },
    links: {
      in: isAllNetwork
        ? queriesToLink([queries?.NETWORK_IN_BY_INTERFACE_USAGE, queries?.NETWORK_IN_USAGE])
        : queriesToLink(queries?.NETWORK_IN_USAGE),
      out: isAllNetwork
        ? queriesToLink([queries?.NETWORK_OUT_BY_INTERFACE_USAGE, queries?.NETWORK_OUT_USAGE])
        : queriesToLink(queries?.NETWORK_OUT_USAGE),
      total: isAllNetwork
        ? queriesToLink([queries?.NETWORK_TOTAL_BY_INTERFACE_USAGE, queries?.NETWORK_TOTAL_USAGE])
        : queriesToLink(queries?.NETWORK_TOTAL_USAGE),
    },
  };
};

export default useNetworkData;
