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
    in: PrometheusResult[];
    out: PrometheusResult[];
    total: PrometheusResult[];
  };
  links: { [key: string]: string };
};

const useNetworkData: UseNetworkData = (vmi, nic) => {
  const { currentTime, duration, timespan } = useDuration();
  const queries = useMemo(
    () => getUtilizationQueries({ duration, nic, obj: vmi }),
    [vmi, duration, nic],
  );
  const isAllNetwork = nic === ALL_NETWORKS;

  const [networkByNICTotal] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: vmi?.metadata?.namespace,
    query: queries?.NETWORK_TOTAL_BY_INTERFACE_USAGE,
    timespan,
  });
  const [networkByNICIn] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: vmi?.metadata?.namespace,
    query: queries?.NETWORK_IN_BY_INTERFACE_USAGE,
    timespan,
  });
  const [networkByNICOut] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: vmi?.metadata?.namespace,
    query: queries?.NETWORK_OUT_BY_INTERFACE_USAGE,
    timespan,
  });
  const [networkTotal] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: vmi?.metadata?.namespace,
    query: isAllNetwork && queries?.NETWORK_TOTAL_USAGE,
    timespan,
  });

  const [networkIn] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: vmi?.metadata?.namespace,
    query: isAllNetwork && queries?.NETWORK_IN_USAGE,
    timespan,
  });

  const [networkOut] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: vmi?.metadata?.namespace,
    query: isAllNetwork && queries?.NETWORK_OUT_USAGE,
    timespan,
  });
  return {
    data: {
      in: [
        ...getPrometheusDataByNic(networkByNICIn, nic),
        ...(isAllNetwork ? getPrometheusDataAllNics(networkIn) : []),
      ],
      out: [
        ...getPrometheusDataByNic(networkByNICOut, nic),
        ...(isAllNetwork ? getPrometheusDataAllNics(networkOut) : []),
      ],
      total: [
        ...getPrometheusDataByNic(networkByNICTotal, nic),
        ...(isAllNetwork ? getPrometheusDataAllNics(networkTotal) : []),
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
