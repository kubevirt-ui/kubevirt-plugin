import { useMemo } from 'react';

import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
  ProjectModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseCloneVMResources = (vm: V1VirtualMachine) => {
  error: any;
  loaded: boolean;
  projectNames: string[];
  projects: K8sResourceCommon[];
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
};

const useCloneVMResources: UseCloneVMResources = (vm: V1VirtualMachine) => {
  const [projects = [], projectsLoaded, projectsLoadError] = useK8sWatchResource<
    K8sResourceCommon[]
  >({
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
    isList: true,
  });

  const [pvcs, pvcsLoaded, pvcsLoadError] = useK8sWatchResource<
    IoK8sApiCoreV1PersistentVolumeClaim[]
  >({
    groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
    isList: true,
    namespace: vm?.metadata?.namespace,
    namespaced: true,
  });

  const projectNames = useMemo(
    () => projects.map(getName).sort((a, b) => a.localeCompare(b)),
    [projects],
  );

  return {
    error: projectsLoadError || pvcsLoadError,
    loaded: projectsLoaded && pvcsLoaded,
    projectNames,
    projects,
    pvcs,
  };
};

export default useCloneVMResources;
