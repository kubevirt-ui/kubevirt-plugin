import React, { ReactElement, useMemo } from 'react';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
  ProjectModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { convertResourceArrayToMap } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { SelectOption } from '@patternfly/react-core';

export const filter = (options: string[]) => {
  return (_, value: string): ReactElement[] => {
    let newOptions = options;

    if (value) {
      const regex = new RegExp(value, 'i');
      newOptions = options?.filter((namespace) => regex.test(namespace));
    }

    return newOptions?.map((namespace) => (
      <SelectOption key={namespace} value={namespace} />
    )) as ReactElement[];
  };
};

type useProjectsAndPVCsReturnType = {
  error: Error;
  filteredPVCNames: string[];
  projectsLoaded: boolean;
  projectsNames: string[];
  pvcMapper: { [name: string]: IoK8sApiCoreV1PersistentVolumeClaim };
  pvcsLoaded: boolean;
};

export const useProjectsAndPVCs = (projectSelected: string): useProjectsAndPVCsReturnType => {
  const [projects, projectsLoaded, projectsErrors] = useK8sWatchResource<K8sResourceCommon[]>({
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
        groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
        isList: true,
        namespace: projectSelected,
        namespaced: true,
      }
    : null;

  const [pvcs, pvcsLoaded, pvcsErrors] =
    useK8sWatchResource<IoK8sApiCoreV1PersistentVolumeClaim[]>(pvcWatchResource);

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
