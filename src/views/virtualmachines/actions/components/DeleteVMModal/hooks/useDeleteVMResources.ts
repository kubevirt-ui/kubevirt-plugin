import {
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
  SecretModel,
} from '@kubevirt-ui/kubevirt-api/console';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import VirtualMachineSnapshotModel from '@kubevirt-ui/kubevirt-api/console/models/VirtualMachineSnapshotModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes/models';
import {
  V1beta1VirtualMachineSnapshot,
  V1VirtualMachine,
} from '@kubevirt-ui/kubevirt-api/kubevirt';
import { getName } from '@kubevirt-utils/resources/shared';
import { getRootDiskSecretRef, getVolumes } from '@kubevirt-utils/resources/vm';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import useConvertedVolumeNames from './useConvertedVolumeNames';

type UseDeleteVMResources = (vm: V1VirtualMachine) => {
  dataVolumes: V1beta1DataVolume[];
  error: any;
  loaded: boolean;
  pvcs: IoK8sApiCoreV1PersistentVolumeClaim[];
  secrets: IoK8sApiCoreV1Secret[];
  snapshots: V1beta1VirtualMachineSnapshot[];
};

const useDeleteVMResources: UseDeleteVMResources = (vm) => {
  const { dvVolumesNames, isDataVolumeGarbageCollector, pvcVolumesNames } = useConvertedVolumeNames(
    getVolumes(vm),
  );
  const namespace = vm?.metadata?.namespace;
  const [dataVolumes, dataVolumesLoaded, dataVolumesLoadError] = useK8sWatchResource<
    V1beta1DataVolume[]
  >({
    groupVersionKind: modelToGroupVersionKind(DataVolumeModel),
    isList: true,
    namespace,
    namespaced: true,
  });

  const filteredDataVolumes = dataVolumes?.filter((dv) => dvVolumesNames?.includes(getName(dv)));

  const [pvcs, pvcsLoaded, pvcsLoadError] = useK8sWatchResource<
    IoK8sApiCoreV1PersistentVolumeClaim[]
  >({
    groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
    isList: true,
    namespace,
    namespaced: true,
  });

  const filteredPvcs = isDataVolumeGarbageCollector
    ? pvcs?.filter((pvc) => [...dvVolumesNames, ...pvcVolumesNames].includes(getName(pvc)))
    : [];

  const [snapshots, snapshotsLoaded, snapshotsLoadError] = useK8sWatchResource<
    V1beta1VirtualMachineSnapshot[]
  >({
    groupVersionKind: modelToGroupVersionKind(VirtualMachineSnapshotModel),
    isList: true,
    namespace,
    namespaced: true,
  });

  const [secrets, secretsLoaded, secretsLoadError] = useK8sWatchResource<IoK8sApiCoreV1Secret[]>({
    groupVersionKind: modelToGroupVersionKind(SecretModel),
    isList: true,
    namespace,
    namespaced: true,
    optional: true,
  });

  const dvSecretRef = getRootDiskSecretRef(vm);
  const filteredSecret = secrets?.find((secret) => getName(secret) === dvSecretRef);

  return {
    dataVolumes: filteredDataVolumes,
    error: snapshotsLoadError || dataVolumesLoadError || pvcsLoadError || secretsLoadError,
    loaded: snapshotsLoaded && dataVolumesLoaded && pvcsLoaded && secretsLoaded,
    pvcs: filteredPvcs,
    secrets: filteredSecret ? [filteredSecret] : [],
    snapshots: snapshots?.filter(
      (snapshot) =>
        snapshot?.metadata?.ownerReferences?.some((ref) => ref?.name === vm?.metadata?.name) ||
        snapshot?.spec?.source?.name === vm?.metadata?.name,
    ),
  };
};

export default useDeleteVMResources;
