import { useMemo } from 'react';

import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import {
  Operator,
  useActiveNamespace,
  useK8sWatchResource,
} from '@openshift-console/dynamic-plugin-sdk';

import { createJobWatchConfig, KUBEVIRT_VM_LATENCY_LABEL } from '../../../utils/utils';
import { SELF_VALIDATION_LABEL_VALUE, SELF_VALIDATION_RESULTS_ONLY_LABEL } from '../../utils';

type UseCheckupsSelfValidationDataResults = {
  configMaps: IoK8sApiCoreV1ConfigMap[] | undefined;
  error: null | unknown;
  jobs: IoK8sApiBatchV1Job[] | undefined;
  loaded: boolean;
};

const useCheckupsSelfValidationData = (): UseCheckupsSelfValidationDataResults => {
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
    () =>
      createJobWatchConfig(SELF_VALIDATION_LABEL_VALUE, namespace, [
        {
          key: SELF_VALIDATION_RESULTS_ONLY_LABEL,
          operator: Operator.DoesNotExist,
        },
      ]),
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
