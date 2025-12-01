import { useMemo } from 'react';

import {
  ConfigMapModel,
  JobModel,
  modelToGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useActiveNamespace, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { KUBEVIRT_VM_LATENCY_LABEL } from '../../utils/utils';
import { KUBEVIRT_VM_LATENCY_LABEL_VALUE } from '../utils/utils';

const useCheckupsNetworkData = () => {
  const [namespace] = useActiveNamespace();

  const configMapWatchConfig = useMemo(
    () => ({
      groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
      isList: true,
      ...(namespace !== ALL_NAMESPACES_SESSION_KEY && { namespace, namespaced: true }),
      selector: {
        matchLabels: {
          [KUBEVIRT_VM_LATENCY_LABEL]: KUBEVIRT_VM_LATENCY_LABEL_VALUE,
        },
      },
    }),
    [namespace],
  );

  const jobWatchConfig = useMemo(
    () => ({
      groupVersionKind: modelToGroupVersionKind(JobModel),
      isList: true,
      ...(namespace !== ALL_NAMESPACES_SESSION_KEY && { namespace, namespaced: true }),
      selector: {
        matchLabels: {
          [KUBEVIRT_VM_LATENCY_LABEL]: KUBEVIRT_VM_LATENCY_LABEL_VALUE,
        },
      },
    }),
    [namespace],
  );

  const [configMaps, configMapsLoaded, loadErrorConfigMaps] =
    useK8sWatchResource<IoK8sApiCoreV1ConfigMap[]>(configMapWatchConfig);

  const [jobs, jobsLoaded, loadErrorJobs] =
    useK8sWatchResource<IoK8sApiBatchV1Job[]>(jobWatchConfig);
  return {
    configMaps,
    error: loadErrorConfigMaps || loadErrorJobs,
    jobs,
    loaded: configMapsLoaded && jobsLoaded,
  };
};

export default useCheckupsNetworkData;
