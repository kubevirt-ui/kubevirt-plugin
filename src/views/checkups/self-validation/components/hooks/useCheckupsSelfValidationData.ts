import { useMemo } from 'react';

import {
  ConfigMapModel,
  JobModel,
  modelToGroupVersionKind,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import {
  Operator,
  useActiveNamespace,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

import { KUBEVIRT_VM_LATENCY_LABEL } from '../../../utils/utils';
import { SELF_VALIDATION_LABEL_VALUE, SELF_VALIDATION_RESULTS_ONLY_LABEL } from '../../utils';

const useCheckupsSelfValidationData = () => {
  const [namespace] = useActiveNamespace();

  const configMapWatchConfig = useMemo(
    () => ({
      groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
      isList: true,
      ...(namespace !== ALL_NAMESPACES_SESSION_KEY && { namespace, namespaced: true }),
      selector: {
        matchLabels: {
          [KUBEVIRT_VM_LATENCY_LABEL]: SELF_VALIDATION_LABEL_VALUE,
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
        matchExpressions: [
          {
            key: SELF_VALIDATION_RESULTS_ONLY_LABEL,
            operator: Operator.DoesNotExist,
          },
        ],
        matchLabels: {
          [KUBEVIRT_VM_LATENCY_LABEL]: SELF_VALIDATION_LABEL_VALUE,
        },
      },
    }),
    [namespace],
  );

  const [configMaps, areConfigMapsLoaded, loadErrorConfigMaps] =
    useK8sWatchResource<IoK8sApiCoreV1ConfigMap[]>(configMapWatchConfig);

  const [jobs, areJobsLoaded, loadErrorJobs] =
    useK8sWatchResource<IoK8sApiBatchV1Job[]>(jobWatchConfig);

  return {
    configMaps,
    error: loadErrorConfigMaps || loadErrorJobs,
    jobs,
    loaded: areConfigMapsLoaded && areJobsLoaded,
  };
};

export default useCheckupsSelfValidationData;
