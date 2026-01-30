import { useMemo } from 'react';

import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
} from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { Operator } from '@openshift-console/dynamic-plugin-sdk';

import { createJobWatchConfig, KUBEVIRT_VM_LATENCY_LABEL } from '../../../utils/utils';
import { SELF_VALIDATION_LABEL_VALUE, SELF_VALIDATION_RESULTS_ONLY_LABEL } from '../../utils';

type UseCheckupsSelfValidationDataResults = {
  configMaps: IoK8sApiCoreV1ConfigMap[] | undefined;
  error: null | unknown;
  jobs: IoK8sApiBatchV1Job[] | undefined;
  loaded: boolean;
};

const useCheckupsSelfValidationData = (): UseCheckupsSelfValidationDataResults => {
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
          [KUBEVIRT_VM_LATENCY_LABEL]: SELF_VALIDATION_LABEL_VALUE,
        },
      },
    }),
    [namespace, cluster],
  );

  const jobWatchConfig = useMemo(
    () =>
      createJobWatchConfig(SELF_VALIDATION_LABEL_VALUE, namespace, cluster, [
        {
          key: SELF_VALIDATION_RESULTS_ONLY_LABEL,
          operator: Operator.DoesNotExist,
        },
      ]),
    [namespace, cluster],
  );

  const [configMaps, areConfigMapsLoaded, loadErrorConfigMaps] =
    useKubevirtWatchResource<IoK8sApiCoreV1ConfigMap[]>(configMapWatchConfig);

  const [jobs, areJobsLoaded, loadErrorJobs] =
    useKubevirtWatchResource<IoK8sApiBatchV1Job[]>(jobWatchConfig);

  return {
    configMaps,
    error: loadErrorConfigMaps || loadErrorJobs,
    jobs,
    loaded: (areConfigMapsLoaded || !!loadErrorConfigMaps) && (areJobsLoaded || !!loadErrorJobs),
  };
};

export default useCheckupsSelfValidationData;
