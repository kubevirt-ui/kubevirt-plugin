import { KUBEVIRT_VM_LATENCY_LABEL } from 'src/views/checkups/utils/utils';

import {
  ConfigMapModel,
  JobModel,
  modelToGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource';
import { useActiveNamespace } from '@openshift-console/dynamic-plugin-sdk';

import { KUBEVIRT_STORAGE_LABEL_VALUE } from '../../utils/utils';

const useCheckupsStorageData = () => {
  const [namespace] = useActiveNamespace();

  const [configMaps, loadingConfigMap, loadErrorConfigMaps] = useKubevirtWatchResource<
    IoK8sApiCoreV1ConfigMap[]
  >({
    groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
    isList: true,
    ...(namespace !== ALL_NAMESPACES_SESSION_KEY && { namespace, namespaced: true }),
    selector: {
      matchLabels: {
        [KUBEVIRT_VM_LATENCY_LABEL]: KUBEVIRT_STORAGE_LABEL_VALUE,
      },
    },
  });

  const [jobs, loadingJobs, loadErrorJobs] = useKubevirtWatchResource<IoK8sApiBatchV1Job[]>({
    groupVersionKind: modelToGroupVersionKind(JobModel),
    isList: true,
    ...(namespace !== ALL_NAMESPACES_SESSION_KEY && { namespace, namespaced: true }),
    selector: {
      matchLabels: {
        [KUBEVIRT_VM_LATENCY_LABEL]: KUBEVIRT_STORAGE_LABEL_VALUE,
      },
    },
  });
  return {
    configMaps,
    error: loadErrorConfigMaps || loadErrorJobs,
    jobs,
    loading: loadingConfigMap && loadingJobs,
  };
};

export default useCheckupsStorageData;
