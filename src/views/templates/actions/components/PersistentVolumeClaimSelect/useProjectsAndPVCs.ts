import { useMemo } from 'react';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
  ProjectModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type useProjectsAndPVCsReturnType = {
  error: Error;
  filteredPVCNames: string[];
  projectsLoaded: boolean;
  projectsNames: string[];
  pvcsLoaded: boolean;
};

export const useProjectsAndPVCs = (projectSelected: string): useProjectsAndPVCsReturnType => {
  const [projects, projectsLoaded, projectsErrors] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
    namespaced: false,
  });

  const [pvcs, pvcsLoaded, pvcsErrors] = useK8sWatchResource<K8sResourceCommon[]>(
    projectSelected
      ? {
          groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
          isList: true,
          namespace: projectSelected,
          namespaced: true,
        }
      : null,
  );

  const projectsNames = useMemo(
    () =>
      (projects || [])
        ?.map((project) => project?.metadata?.name)
        ?.sort((a, b) => a?.localeCompare(b)),
    [projects],
  );
  const filteredPVCNames = useMemo(() => (pvcs || [])?.map((pvc) => pvc?.metadata?.name), [pvcs]);

  return {
    error: projectsErrors || pvcsErrors,
    filteredPVCNames,
    projectsLoaded,
    projectsNames,
    pvcsLoaded,
  };
};
