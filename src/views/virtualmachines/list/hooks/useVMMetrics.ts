import { useEffect, useMemo } from 'react';

import { IoK8sApiCoreV1Pod } from '@kubevirt-ui/kubevirt-api/kubernetes';
import useNamespaceParam from '@kubevirt-utils/hooks/useNamespaceParam';
import { modelToGroupVersionKind, PodModel } from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useIsAllClustersPage from '@multicluster/hooks/useIsAllClustersPage';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import useVMListQueries from '@multicluster/hooks/useVMListQueries';
import { PrometheusEndpoint } from '@openshift-console/dynamic-plugin-sdk';
import { useFleetPrometheusPoll } from '@stolostron/multicluster-sdk';

import { setVMCPURequested, setVMCPUUsage, setVMMemoryUsage, setVMNetworkUsage } from '../metrics';

import { VMListQueries } from './constants';
import { getVMNamesFromPodsNames } from './utils';

const useVMMetrics = () => {
  const namespace = useNamespaceParam();
  const cluster = useClusterParam();
  const allClusters = useIsAllClustersPage();

  const currentTime = useMemo<number>(() => Date.now(), []);

  const [pods] = useK8sWatchData<IoK8sApiCoreV1Pod[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(PodModel),
    isList: true,
    namespace,
  });

  const launcherNameToVMName = useMemo(() => getVMNamesFromPodsNames(pods), [pods]);

  const queries = useVMListQueries();

  const prometheusPollProps = {
    allClusters,
    cluster,
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace,
  };

  const [memoryUsageResponse] = useFleetPrometheusPoll({
    ...prometheusPollProps,
    query: queries?.[VMListQueries.MEMORY_USAGE],
  });

  const [networkTotalResponse] = useFleetPrometheusPoll({
    ...prometheusPollProps,
    query: queries?.NETWORK_TOTAL_USAGE,
  });

  const [cpuUsageResponse] = useFleetPrometheusPoll({
    ...prometheusPollProps,
    query: queries?.[VMListQueries.CPU_USAGE],
  });

  const [cpuRequestedResponse] = useFleetPrometheusPoll({
    ...prometheusPollProps,
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
