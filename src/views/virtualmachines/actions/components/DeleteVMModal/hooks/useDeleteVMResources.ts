import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui/kubevirt-api/console';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import VirtualMachineSnapshotModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineSnapshotModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import {
  V1alpha1VirtualMachineSnapshot,
  V1VirtualMachine,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getVolumes } from '@kubevirt-utils/resources/vm';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import useDataVolumeConvertedVolumeNames from './useDataVolumeConvertedVolumeNames';

type UseDeleteVMResources = (vm: V1VirtualMachine) => {
  dataVolumes: V1beta1DataVolume[];
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  snapshots: V1alpha1VirtualMachineSnapshot[];
  loaded: boolean;
  error: any;
};

const useDeleteVMResources: UseDeleteVMResources = (vm) => {
  const { dvVolumesNames, pvcVolumesNames } = useDataVolumeConvertedVolumeNames(getVolumes(vm));
  const namespace = vm?.metadata?.namespace;
  const [dataVolumes, dataVolumesLoaded, dataVolumesLoadError] = useK8sWatchResource<
    V1beta1DataVolume[]
  >({
    isList: true,
    groupVersionKind: modelToGroupVersionKind(DataVolumeModel),
    namespaced: true,
    namespace,
  });

  const filteredDataVolumes = dataVolumes?.filter((dv) =>
    dvVolumesNames?.includes(dv?.metadata?.name),
  );

  const [pvcs, pvcsLoaded, pvcsLoadError] = useK8sWatchResource<
    IoK8sApiCoreV1PersistentVolumeClaim[]
  >({
    isList: true,
    groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
    namespaced: true,
    namespace,
  });

  const filteredPvcs = pvcs?.filter((pvc) => pvcVolumesNames?.includes(pvc?.metadata?.name));

  const [snapshots, snapshotsLoaded, snapshotsLoadError] = useK8sWatchResource<
    V1alpha1VirtualMachineSnapshot[]
  >({
    isList: true,
    groupVersionKind: modelToGroupVersionKind(VirtualMachineSnapshotModel),
    namespaced: true,
    namespace,
  });

  return {
    dataVolumes: filteredDataVolumes,
    pvcs: filteredPvcs,
    snapshots: snapshots?.filter(
      (snapshot) =>
        snapshot?.metadata?.ownerReferences?.some((ref) => ref?.name === vm?.metadata?.name) ||
        snapshot?.spec?.source?.name === vm?.metadata?.name,
    ),
    loaded: snapshotsLoaded && dataVolumesLoaded && pvcsLoaded,
    error: snapshotsLoadError || dataVolumesLoadError || pvcsLoadError,
  };
};

export default useDeleteVMResources;
