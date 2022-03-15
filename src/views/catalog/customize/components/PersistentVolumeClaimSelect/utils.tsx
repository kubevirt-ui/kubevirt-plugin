import * as React from 'react';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
  ProjectModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { V1alpha1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { SelectOption } from '@patternfly/react-core';

export const filter = (options: string[]) => {
  return (_, value: string): React.ReactElement[] => {
    let newOptions = options;

    if (value) {
      const regex = new RegExp(value, 'i');
      newOptions = options.filter((namespace) => regex.test(namespace));
    }

    return newOptions.map((namespace) => (
      <SelectOption key={namespace} value={namespace} />
    )) as React.ReactElement[];
  };
};

type useProjectsAndPVCsReturnType = {
  projectsNames: string[];
  filteredPVCNames: string[];
  loaded: boolean;
  error: Error;
};

export const useProjectsAndPVCs = (projectSelected: string): useProjectsAndPVCsReturnType => {
  const [projects, projectsLoaded, projectsErrors] = useK8sWatchResource<K8sResourceCommon[]>({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    namespaced: false,
    isList: true,
  });

  const projectsNames = projects.map((project) => project.metadata.name);

  const [pvcs, pvcsLoaded, pvcsErrors] = useK8sWatchResource<V1alpha1PersistentVolumeClaim[]>({
    groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
    namespaced: false,
    isList: true,
  });

  const pvcNamesFilteredByProjects = pvcs
    .filter((pvc) => pvc.metadata.namespace === projectSelected)
    .map((pvc) => pvc.metadata.name);

  return {
    projectsNames,
    filteredPVCNames: pvcNamesFilteredByProjects,
    loaded: projectsLoaded && pvcsLoaded,
    error: projectsErrors || pvcsErrors,
  };
};
