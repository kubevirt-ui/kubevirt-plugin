import { useMemo } from 'react';

import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
  ProjectModel,
} from '@kubevirt-utils/models';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type useProjectsAndPVCsReturnType = {
  projectsNames: string[];
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  projectsLoaded: boolean;
  pvcsLoaded: boolean;
  error: Error;
};

export const useProjectsAndPVCs = (projectSelected: string): useProjectsAndPVCsReturnType => {
  const [projects, projectsLoaded, projectsErrors] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    namespaced: false,
    isList: true,
  });

  const projectsNames = useMemo(
    () => projects?.map((project) => project?.metadata?.name)?.sort((a, b) => a?.localeCompare(b)),
    [projects],
  );

  const pvcWathcResource = projectSelected
    ? {
        groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
        namespaced: true,
        isList: true,
        namespace: projectSelected,
      }
    : null;

  const [pvcsRaw, pvcsLoaded, pvcsErrors] =
    useK8sWatchResource<IoK8sApiCoreV1PersistentVolumeClaim[]>(pvcWathcResource);

  const pvcs = useMemo(
    () => (pvcsRaw || [])?.sort((a, b) => a?.metadata?.name?.localeCompare(b?.metadata?.name)),
    [pvcsRaw],
  );

  return {
    projectsNames,
    pvcs,
    projectsLoaded,
    pvcsLoaded,
    error: projectsErrors || pvcsErrors,
  };
};
