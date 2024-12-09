import { useEffect, useMemo } from 'react';

import { IoK8sApiCoreV1Pod } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { modelToGroupVersionKind, PodModel } from '@kubevirt-utils/models';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import {
  PrometheusEndpoint,
  useActiveNamespace,
  useK8sWatchResource,
  usePrometheusPoll,
} from '@openshift-console/dynamic-plugin-sdk';

import {
  setVMCPURequested,
  setVMCPUUsage,
  setVMMemoryRequested,
  setVMMemoryUsage,
  setVMNetworkUsage,
} from '../metrics';

import { getVMListQueries, VMListQueries } from './constants';
import { getVMNamesFromPodsNames } from './utils';

const useVMMetrics = () => {
  const [activeNamespace] = useActiveNamespace();
  const allNamespace = useMemo(
    () => activeNamespace === ALL_NAMESPACES_SESSION_KEY,
    [activeNamespace],
  );
  const currentTime = useMemo<number>(() => Date.now(), []);

  const [pods] = useK8sWatchResource<IoK8sApiCoreV1Pod[]>({
    groupVersionKind: modelToGroupVersionKind(PodModel),
    isList: true,
    namespace: allNamespace ? undefined : activeNamespace,
  });

  const launcherNameToVMName = useMemo(() => getVMNamesFromPodsNames(pods), [pods]);

  const queries = useMemo(() => getVMListQueries(activeNamespace), [activeNamespace]);

  const [memoryUsageResponse] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace: allNamespace ? undefined : activeNamespace,
    query: queries?.[VMListQueries.MEMORY_USAGE],
  });

  const [networkTotalResponse] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace: allNamespace ? undefined : activeNamespace,
    query: queries?.NETWORK_TOTAL_USAGE,
  });

  const [memoryRequestedResponse] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace: allNamespace ? undefined : activeNamespace,
    query: queries?.[VMListQueries.MEMORY_REQUESTED],
  });

  const [cpuUsageResponse] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace: allNamespace ? undefined : activeNamespace,
    query: queries?.[VMListQueries.CPU_USAGE],
  });

  const [cpuRequestedResponse] = usePrometheusPoll({
    endpoint: PrometheusEndpoint?.QUERY,
    endTime: currentTime,
    namespace: allNamespace ? undefined : activeNamespace,
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
    memoryRequestedResponse?.data?.result?.forEach((result) => {
      const vmName = launcherNameToVMName?.[`${result?.metric?.namespace}-${result?.metric?.pod}`];

      if (isEmpty(vmName)) return;
      const vmNamespace = result?.metric?.namespace;

      const memoryRequested = parseFloat(result?.value?.[1]);

      setVMMemoryRequested(vmName, vmNamespace, memoryRequested);
    });
  }, [memoryRequestedResponse, launcherNameToVMName]);

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
