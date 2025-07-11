import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import {
  getPrometheusDataAllNics,
  getPrometheusDataByNic,
  queriesToLink,
} from '@kubevirt-utils/components/Charts/utils/utils';
import useVMQueries from '@kubevirt-utils/hooks/useVMQueries';
import { getNamespace } from '@kubevirt-utils/resources/shared';
import { getCluster } from '@multicluster/helpers/selectors';
import { PrometheusEndpoint, PrometheusResult } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetPrometheusPoll } from '@stolostron/multicluster-sdk';

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
  const { currentTime, timespan } = useDuration();

  const queries = useVMQueries(vmi);

  const isAllNetwork = nic === ALL_NETWORKS;

  const prometheusProps = {
    cluster: getCluster(vmi),
    endpoint: PrometheusEndpoint?.QUERY_RANGE,
    endTime: currentTime,
    namespace: getNamespace(vmi),
    timespan,
  };
  const [networkByNICTotal] = useFleetPrometheusPoll({
    ...prometheusProps,
    query: queries?.NETWORK_TOTAL_BY_INTERFACE_USAGE,
  });
  const [networkByNICIn] = useFleetPrometheusPoll({
    ...prometheusProps,
    query: queries?.NETWORK_IN_BY_INTERFACE_USAGE,
  });

  const [networkByNICOut] = useFleetPrometheusPoll({
    ...prometheusProps,
    query: queries?.NETWORK_OUT_BY_INTERFACE_USAGE,
  });
  const [networkTotal] = useFleetPrometheusPoll({
    ...prometheusProps,
    query: isAllNetwork && queries?.NETWORK_TOTAL_USAGE,
  });

  const [networkIn] = useFleetPrometheusPoll({
    ...prometheusProps,
    query: isAllNetwork && queries?.NETWORK_IN_USAGE,
  });

  const [networkOut] = useFleetPrometheusPoll({
    ...prometheusProps,
    query: isAllNetwork && queries?.NETWORK_OUT_USAGE,
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
