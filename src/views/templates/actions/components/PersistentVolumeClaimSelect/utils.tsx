import React, { ReactElement, useMemo } from 'react';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
  ProjectModel,
} from '@kubevirt-ui/kubevirt-api/console';
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
  projectsNames: string[];
  filteredPVCNames: string[];
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

  const [pvcs, pvcsLoaded, pvcsErrors] = useK8sWatchResource<K8sResourceCommon[]>(
    projectSelected
      ? {
          groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
          namespaced: true,
          namespace: projectSelected,
          isList: true,
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
    projectsNames,
    filteredPVCNames,
    projectsLoaded,
    pvcsLoaded,
    error: projectsErrors || pvcsErrors,
  };
};
