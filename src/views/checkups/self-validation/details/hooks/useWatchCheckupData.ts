import { useMemo } from 'react';
import { useParams } from 'react-router-dom-v5-compat';

import { ConfigMapModel, modelToGroupVersionKind } from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiBatchV1Job, IoK8sApiCoreV1ConfigMap } from '@kubevirt-ui/kubevirt-api/kubernetes';
import useActiveNamespace from '@kubevirt-utils/hooks/useActiveNamespace';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import { getName } from '@kubevirt-utils/resources/shared';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { Operator } from '@openshift-console/dynamic-plugin-sdk';

import { createJobWatchConfig, getJobByName } from '../../../utils/utils';
import { SELF_VALIDATION_LABEL_VALUE, SELF_VALIDATION_RESULTS_ONLY_LABEL } from '../../utils';

type UseWatchCheckupDataResults = {
  configMap: IoK8sApiCoreV1ConfigMap | undefined;
  error: null | unknown;
  jobMatches: IoK8sApiBatchV1Job[] | undefined;
  loaded: boolean;
};

const useWatchCheckupData = (): UseWatchCheckupDataResults => {
  const { checkupName } = useParams<{ checkupName: string }>();
  const namespace = useActiveNamespace();
  const cluster = useClusterParam();

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

  const [configMap, configMapLoaded, configMapError] =
    useKubevirtWatchResource<IoK8sApiCoreV1ConfigMap>({
      cluster,
      groupVersionKind: modelToGroupVersionKind(ConfigMapModel),
      name: checkupName,
      namespace,
      namespaced: true,
    });

  const [jobs, areJobsLoaded, loadErrorJobs] =
    useKubevirtWatchResource<IoK8sApiBatchV1Job[]>(jobWatchConfig);

  const jobMatches = configMap ? getJobByName(jobs, getName(configMap), false) : [];

  return {
    configMap,
    error: configMapError || loadErrorJobs,
    jobMatches,
    loaded: configMapLoaded && areJobsLoaded,
  };
};

export default useWatchCheckupData;
