import { useMemo } from 'react';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
  ProjectModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { convertResourceArrayToMap } from '@kubevirt-utils/resources/shared';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

type useProjectsAndPVCsReturnType = {
  error: Error;
  filteredPVCNames: string[];
  projectsLoaded: boolean;
  projectsNames: string[];
  pvcMapper: { [name: string]: IoK8sApiCoreV1PersistentVolumeClaim };
  pvcsLoaded: boolean;
};

export const useProjectsAndPVCs = (projectSelected: string): useProjectsAndPVCsReturnType => {
  const cluster = useClusterParam();
  const [projects, projectsLoaded, projectsErrors] = useK8sWatchData<K8sResourceCommon[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
    namespaced: true,
  });

  const projectsNames = useMemo(
    () => projects?.map((project) => project?.metadata?.name)?.sort((a, b) => a?.localeCompare(b)),
    [projects],
  );

  const pvcWatchResource = projectSelected
    ? {
        cluster,
        groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
        isList: true,
        namespace: projectSelected,
        namespaced: true,
      }
    : null;

  const [pvcs, pvcsLoaded, pvcsErrors] =
    useK8sWatchData<IoK8sApiCoreV1PersistentVolumeClaim[]>(pvcWatchResource);

  const pvcNamesFilteredByProjects = useMemo(
    () =>
      (pvcs || [])
        ?.filter(
          (pvc) =>
            pvc?.metadata?.namespace === projectSelected &&
            !pvc?.metadata?.deletionTimestamp &&
            pvc?.status?.phase === 'Bound',
        )
        ?.map((pvc) => pvc?.metadata?.name)
        ?.sort((a, b) => a?.localeCompare(b)),
    [projectSelected, pvcs],
  );

  return {
    error: projectsErrors || pvcsErrors,
    filteredPVCNames: pvcNamesFilteredByProjects,
    projectsLoaded,
    projectsNames,
    pvcMapper: convertResourceArrayToMap(pvcs, true),
    pvcsLoaded,
  };
};
