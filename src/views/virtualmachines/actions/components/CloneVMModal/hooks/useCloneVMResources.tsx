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
  projects: K8sResourceCommon[];
  projectNames: string[];
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  loaded: boolean;
  error: any;
};

const useCloneVMResources: UseCloneVMResources = (vm: V1VirtualMachine) => {
  const [projects = [], projectsLoaded, projectsLoadError] = useK8sWatchResource<
    K8sResourceCommon[]
  >({
    isList: true,
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
  });

  const [pvcs, pvcsLoaded, pvcsLoadError] = useK8sWatchResource<
    IoK8sApiCoreV1PersistentVolumeClaim[]
  >({
    isList: true,
    groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
    namespaced: true,
    namespace: vm?.metadata?.namespace,
  });

  const projectNames = useMemo(
    () => projects.map(getName).sort((a, b) => a.localeCompare(b)),
    [projects],
  );

  return {
    projects,
    projectNames,
    pvcs,
    loaded: projectsLoaded && pvcsLoaded,
    error: projectsLoadError || pvcsLoadError,
  };
};

export default useCloneVMResources;
