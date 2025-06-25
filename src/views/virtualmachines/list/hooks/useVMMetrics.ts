import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { IoK8sApiCoreV1Pod } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { modelToGroupVersionKind, PodModel } from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import useIsACMPage from '@multicluster/useIsACMPage';
import { PrometheusEndpoint } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetPrometheusPoll, useHubClusterName } from '@stolostron/multicluster-sdk';

import { setVMCPURequested, setVMCPUUsage, setVMMemoryUsage, setVMNetworkUsage } from '../metrics';

import { getVMListQueries, VMListQueries } from './constants';
import { getVMNamesFromPodsNames } from './utils';

const useVMMetrics = () => {
  const { cluster, ns: namespace } = useParams<{ cluster?: string; ns?: string }>();

  const currentTime = useMemo<number>(() => Date.now(), []);
  const [hubClusterName] = useHubClusterName();
  const isACMPage = useIsACMPage();

  const [pods] = useK8sWatchData<IoK8sApiCoreV1Pod[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(PodModel),
    isList: true,
    namespace,
  });

  const launcherNameToVMName = useMemo(() => getVMNamesFromPodsNames(pods), [pods]);

  const queries = useMemo(
    () =>
      getVMListQueries(
        namespace,
        cluster === hubClusterName ? undefined : cluster,
        isACMPage && isEmpty(cluster),
      ),
    [namespace, hubClusterName, cluster, isACMPage],
  );

  const [memoryUsageResponse] = useFleetPrometheusPoll({
    cluster,
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace,
    query: queries?.[VMListQueries.MEMORY_USAGE],
  });

  const [networkTotalResponse] = useFleetPrometheusPoll({
    cluster,
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace,
    query: queries?.NETWORK_TOTAL_USAGE,
  });

  const [cpuUsageResponse] = useFleetPrometheusPoll({
    cluster,
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace,
    query: queries?.[VMListQueries.CPU_USAGE],
  });

  const [cpuRequestedResponse] = useFleetPrometheusPoll({
    cluster,
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace,
    query: queries?.[VMListQueries.CPU_REQUESTED],
  });

  useEffect(() => {
    networkTotalResponse?.data?.result?.forEach((result) => {
      const vmName = result?.metric?.name;
      const vmNamespace = result?.metric?.namespace;
      const memoryUsage = parseFloat(result?.value?.[1]);

      setVMNetworkUsage(vmName, vmNamespace, memoryUsage);
    });
  }, [networkTotalResponse]);

  useEffect(() => {
    memoryUsageResponse?.data?.result?.forEach((result) => {
      const vmName = result?.metric?.name;
      const vmNamespace = result?.metric?.namespace;
      const memoryUsage = parseFloat(result?.value?.[1]);

      setVMMemoryUsage(vmName, vmNamespace, memoryUsage);
    });
  }, [memoryUsageResponse]);

  useEffect(() => {
    cpuUsageResponse?.data?.result?.forEach((result) => {
      const vmName = result?.metric?.name;
      const vmNamespace = result?.metric?.namespace;
      const cpuUsage = parseFloat(result?.value?.[1]);

      setVMCPUUsage(vmName, vmNamespace, cpuUsage);
    });
  }, [cpuUsageResponse]);

  useEffect(() => {
    cpuRequestedResponse?.data?.result?.forEach((result) => {
      const vmName = launcherNameToVMName?.[`${result?.metric?.namespace}-${result?.metric?.pod}`];

      if (isEmpty(vmName)) return;

      const vmNamespace = result?.metric?.namespace;
      const cpuRequested = parseFloat(result?.value?.[1]);

      setVMCPURequested(vmName, vmNamespace, cpuRequested);
    });
  }, [cpuRequestedResponse, launcherNameToVMName]);
};

export default useVMMetrics;
