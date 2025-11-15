import { useMemo } from 'react';

import {
  ConfigMapModel,
  JobModel,
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui/kubevirt-api/console';
import {
  IoK8sApiBatchV1Job,
  IoK8sApiCoreV1ConfigMap,
  IoK8sApiCoreV1PersistentVolumeClaim,
} from '@kubevirt-ui/kubevirt-api/kubernetes';
import { ALL_NAMESPACES_SESSION_KEY } from '@kubevirt-utils/hooks/constants';
import { useActiveNamespace, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { KUBEVIRT_VM_LATENCY_LABEL } from '../../../utils/utils';
import { SELF_VALIDATION_LABEL_VALUE, SELF_VALIDATION_NAME } from '../../utils';

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
        matchLabels: {
          [KUBEVIRT_VM_LATENCY_LABEL]: SELF_VALIDATION_LABEL_VALUE,
        },
      },
    }),
    [namespace],
  );

  const pvcWatchConfig = useMemo(
    () => ({
      groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
      isList: true,
      ...(namespace !== ALL_NAMESPACES_SESSION_KEY && { namespace, namespaced: true }),
    }),
    [namespace],
  );

  const [configMaps, areConfigMapsLoaded, loadErrorConfigMaps] =
    useK8sWatchResource<IoK8sApiCoreV1ConfigMap[]>(configMapWatchConfig);

  const [jobs, areJobsLoaded, loadErrorJobs] =
    useK8sWatchResource<IoK8sApiBatchV1Job[]>(jobWatchConfig);

  const [allPvcs, arePvcsLoaded, loadErrorPVCs] =
    useK8sWatchResource<IoK8sApiCoreV1PersistentVolumeClaim[]>(pvcWatchConfig);

  const pvcs = useMemo(
    () =>
      allPvcs?.filter((pvc) => {
        if (pvc.metadata?.labels?.[KUBEVIRT_VM_LATENCY_LABEL] === SELF_VALIDATION_LABEL_VALUE) {
          return true;
        }
        if (pvc.metadata?.name?.startsWith(`${SELF_VALIDATION_NAME}-`)) {
          return true;
        }
        return false;
      }) || [],
    [allPvcs],
  );

  return {
    configMaps,
    error: loadErrorConfigMaps || loadErrorJobs || loadErrorPVCs,
    jobs,
    loaded: areConfigMapsLoaded && areJobsLoaded && arePvcsLoaded,
    pvcs,
  };
};

export default useCheckupsSelfValidationData;
