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
  error: any;
  loaded: boolean;
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  snapshots: V1alpha1VirtualMachineSnapshot[];
};

const useDeleteVMResources: UseDeleteVMResources = (vm) => {
  const { dvVolumesNames, pvcVolumesNames } = useDataVolumeConvertedVolumeNames(getVolumes(vm));
  const namespace = vm?.metadata?.namespace;
  const [dataVolumes, dataVolumesLoaded, dataVolumesLoadError] = useK8sWatchResource<
    V1beta1DataVolume[]
  >({
    groupVersionKind: modelToGroupVersionKind(DataVolumeModel),
    isList: true,
    namespace,
    namespaced: true,
  });

  const filteredDataVolumes = dataVolumes?.filter((dv) =>
    dvVolumesNames?.includes(dv?.metadata?.name),
  );

  const [pvcs, pvcsLoaded, pvcsLoadError] = useK8sWatchResource<
    IoK8sApiCoreV1PersistentVolumeClaim[]
  >({
    groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
    isList: true,
    namespace,
    namespaced: true,
  });

  const filteredPvcs = pvcs?.filter((pvc) => pvcVolumesNames?.includes(pvc?.metadata?.name));

  const [snapshots, snapshotsLoaded, snapshotsLoadError] = useK8sWatchResource<
    V1alpha1VirtualMachineSnapshot[]
  >({
    groupVersionKind: modelToGroupVersionKind(VirtualMachineSnapshotModel),
    isList: true,
    namespace,
    namespaced: true,
  });

  return {
    dataVolumes: filteredDataVolumes,
    error: snapshotsLoadError || dataVolumesLoadError || pvcsLoadError,
    loaded: snapshotsLoaded && dataVolumesLoaded && pvcsLoaded,
    pvcs: filteredPvcs,
    snapshots: snapshots?.filter(
      (snapshot) =>
        snapshot?.metadata?.ownerReferences?.some((ref) => ref?.name === vm?.metadata?.name) ||
        snapshot?.spec?.source?.name === vm?.metadata?.name,
    ),
  };
};

export default useDeleteVMResources;
