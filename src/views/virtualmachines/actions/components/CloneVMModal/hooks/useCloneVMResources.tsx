import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
  ProjectModel,
} from '@kubevirt-ui/kubevirt-api/console';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { K8sResourceCommon, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseCloneVMResources = (vm: V1VirtualMachine) => {
  projects: K8sResourceCommon[];
  dataVolumes: V1beta1DataVolume[];
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  loaded: boolean;
  error: any;
};

const useCloneVMResources: UseCloneVMResources = (vm: V1VirtualMachine) => {
  const [projects, projectsLoaded, projectsLoadError] = useK8sWatchResource<K8sResourceCommon[]>({
    isList: true,
    groupVersionKind: modelToGroupVersionKind(ProjectModel),
  });

  const [dataVolumes, dataVolumesLoaded, DataVolumesLoadError] = useK8sWatchResource<
    V1beta1DataVolume[]
  >({
    isList: true,
    groupVersionKind: modelToGroupVersionKind(DataVolumeModel),
    namespaced: true,
    namespace: vm?.metadata?.namespace,
  });

  const [pvcs, pvcsLoaded, pvcsLoadError] = useK8sWatchResource<
    IoK8sApiCoreV1PersistentVolumeClaim[]
  >({
    isList: true,
    groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
    namespaced: true,
    namespace: vm?.metadata?.namespace,
  });

  return {
    projects,
    dataVolumes,
    pvcs,
    loaded: projectsLoaded && dataVolumesLoaded && pvcsLoaded,
    error: projectsLoadError || DataVolumesLoadError || pvcsLoadError,
  };
};

export default useCloneVMResources;
