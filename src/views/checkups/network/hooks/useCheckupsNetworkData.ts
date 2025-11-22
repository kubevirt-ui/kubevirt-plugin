import { useMemo } from 'react';

import {
  ConfigMapModel,
  JobModel,
  modelToGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useListMulticlusterFilters from '@kubevirt-utils/hooks/useListMulticlusterFilters';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

import { KUBEVIRT_VM_LATENCY_LABEL } from '../../utils/utils';
import { KUBEVIRT_VM_LATENCY_LABEL_VALUE } from '../utils/utils';

const useCheckupsNetworkData = () => {
  const [namespace] = useActiveNamespace();
  const multiclusterFilters = useListMulticlusterFilters();

  const checkupsMulticlusterFilters = useMemo(
    () => [
      {
        property: 'label',
        values: [`${KUBEVIRT_VM_LATENCY_LABEL}=${KUBEVIRT_VM_LATENCY_LABEL_VALUE}`],
      },
      ...multiclusterFilters,
    ],
    [multiclusterFilters],
  );

  const [configMaps, loadingConfigMap, loadErrorConfigMaps] = useKubevirtWatchResource<
    IoK8sApiCoreV1ConfigMap[]
  >(
    {
      groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
      isList: true,
      ...(namespace !== ALL_NAMESPACES_SESSION_KEY && { namespace, namespaced: true }),
      selector: {
        matchLabels: {
          [KUBEVIRT_VM_LATENCY_LABEL]: KUBEVIRT_VM_LATENCY_LABEL_VALUE,
        },
      },
    },
    null,
    checkupsMulticlusterFilters,
  );

  const [jobs, loadingJobs, loadErrorJobs] = useKubevirtWatchResource<IoK8sApiBatchV1Job[]>(
    {
      groupVersionKind: modelToGroupVersionKind(JobModel),
      isList: true,
      ...(namespace !== ALL_NAMESPACES_SESSION_KEY && { namespace, namespaced: true }),
      selector: {
        matchLabels: {
          [KUBEVIRT_VM_LATENCY_LABEL]: KUBEVIRT_VM_LATENCY_LABEL_VALUE,
        },
      },
    },
    null,
    checkupsMulticlusterFilters,
  );
  return {
    configMaps,
    error: loadErrorConfigMaps || loadErrorJobs,
    jobs,
    loading: loadingConfigMap && loadingJobs,
  };
};

export default useCheckupsNetworkData;
