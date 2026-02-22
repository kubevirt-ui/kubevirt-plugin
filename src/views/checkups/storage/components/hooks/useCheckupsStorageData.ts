import { useMemo } from 'react';
import { createJobWatchConfig, KUBEVIRT_VM_LATENCY_LABEL } from 'src/views/checkups/utils/utils';

import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useClusterParam from '@multicluster/hooks/useClusterParam';

import { KUBEVIRT_STORAGE_LABEL_VALUE } from '../../utils/consts';

const useCheckupsStorageData = () => {
  const namespace = useActiveNamespace();
  const cluster = useClusterParam();

  const configMapWatchConfig = useMemo(
    () => ({
      cluster,
      groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
      isList: true,
      ...(namespace !== ALL_NAMESPACES_SESSION_KEY && { namespace, namespaced: true }),
      selector: {
        matchLabels: {
          [KUBEVIRT_VM_LATENCY_LABEL]: KUBEVIRT_STORAGE_LABEL_VALUE,
        },
      },
    }),
    [namespace, cluster],
  );

  const jobWatchConfig = useMemo(
    () => createJobWatchConfig(KUBEVIRT_STORAGE_LABEL_VALUE, namespace, cluster),
    [namespace, cluster],
  );

  const [configMaps, configMapsLoaded, loadErrorConfigMaps] =
    useKubevirtWatchResource<IoK8sApiCoreV1ConfigMap[]>(configMapWatchConfig);

  const [jobs, jobsLoaded, loadErrorJobs] =
    useKubevirtWatchResource<IoK8sApiBatchV1Job[]>(jobWatchConfig);

  return {
    configMaps,
    error: loadErrorConfigMaps || loadErrorJobs,
    jobs,
    loaded: configMapsLoaded && jobsLoaded,
  };
};

export default useCheckupsStorageData;
