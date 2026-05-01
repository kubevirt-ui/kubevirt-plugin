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

import { CheckupLabelValue } from '../constants';
import { createJobWatchConfig, KUBEVIRT_VM_LATENCY_LABEL } from '../utils';

type UseCheckupsDataOptions = {
  jobMatchExpressions?: Array<{ key: string; operator: Operator }>;
  labelValue: CheckupLabelValue;
};

type UseCheckupsDataResult = {
  configMaps: IoK8sApiCoreV1ConfigMap[] | undefined;
  error: Error | null | undefined;
  jobs: IoK8sApiBatchV1Job[] | undefined;
  loaded: boolean;
};

const useCheckupsData = ({
  jobMatchExpressions,
  labelValue,
}: UseCheckupsDataOptions): UseCheckupsDataResult => {
  const namespace = useActiveNamespace();
  const cluster = useClusterParam();

  const configMapWatchConfig = useMemo(
    () => ({
      cluster,
      groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
      isList: true,
      ...(namespace && namespace !== ALL_NAMESPACES_SESSION_KEY && { namespace, namespaced: true }),
      selector: {
        matchLabels: {
          [KUBEVIRT_VM_LATENCY_LABEL]: labelValue,
        },
      },
    }),
    [namespace, cluster, labelValue],
  );

  const jobWatchConfig = useMemo(
    () => createJobWatchConfig(labelValue, namespace, cluster, jobMatchExpressions),
    [namespace, cluster, labelValue, jobMatchExpressions],
  );

  const [configMaps, configMapsLoaded, loadErrorConfigMaps] =
    useKubevirtWatchResource<IoK8sApiCoreV1ConfigMap[]>(configMapWatchConfig);

  const [jobs, jobsLoaded, loadErrorJobs] =
    useKubevirtWatchResource<IoK8sApiBatchV1Job[]>(jobWatchConfig);

  return {
    configMaps,
    error: loadErrorConfigMaps || loadErrorJobs,
    jobs,
    loaded: (configMapsLoaded || !!loadErrorConfigMaps) && (jobsLoaded || !!loadErrorJobs),
  };
};

export default useCheckupsData;
