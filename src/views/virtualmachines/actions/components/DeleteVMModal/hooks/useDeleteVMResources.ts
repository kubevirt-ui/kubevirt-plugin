import { useMemo } from 'react';

import {
  CDIConfigModelGroupVersionKind,
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
  SecretModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineSnapshotModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  V1beta1CDIConfig,
  V1beta1DataVolume,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1Secret } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  V1beta1VirtualMachineSnapshot,
  V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getRootDiskSecretRef, getVolumes } from '@kubevirt-utils/resources/vm';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import { findPVCOwner } from '../utils/helpers';

type UseDeleteVMResourcesResult = {
  error: any;
  loaded: boolean;
  secrets: IoK8sApiCoreV1Secret[];
  snapshots: V1beta1VirtualMachineSnapshot[];
  volumes: (IoK8sApiCoreV1PersistentVolumeClaim | V1beta1DataVolume)[];
};

const useDeleteVMResources = (vm: V1VirtualMachine): UseDeleteVMResourcesResult => {
  const cluster = getCluster(vm);
  const namespace = getNamespace(vm);
  const vmName = getName(vm);
  const dvSecretRef = getRootDiskSecretRef(vm);

  const vmVolumes = useMemo(() => getVolumes(vm) || [], [vm]);

  const dvVolumeNames = useMemo(
    () => vmVolumes.filter((volume) => volume?.dataVolume).map((volume) => volume.dataVolume.name),
    [vmVolumes],
  );

  const pvcVolumeNames = useMemo(
    () =>
      vmVolumes
        .filter((volume) => volume?.persistentVolumeClaim)
        .map((volume) => volume.persistentVolumeClaim.claimName),
    [vmVolumes],
  );

  const [cdiConfig, cdiLoaded] = useK8sWatchData<V1beta1CDIConfig>({
    cluster,
    groupVersionKind: CDIConfigModelGroupVersionKind,
    isList: false,
    namespaced: false,
  });

  const isGarbageCollectorEnabled = cdiLoaded && cdiConfig?.spec?.dataVolumeTTLSeconds !== -1;

  const [allDataVolumes, dvLoaded, dvError] = useK8sWatchData<V1beta1DataVolume[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(DataVolumeModel),
    isList: true,
    namespace,
    namespaced: true,
  });

  const [allPvcs, pvcsLoaded, pvcsError] = useK8sWatchData<IoK8sApiCoreV1PersistentVolumeClaim[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
    isList: true,
    namespace,
    namespaced: true,
  });

  const [allSnapshots, snapshotsLoaded, snapshotsError] = useK8sWatchData<
    V1beta1VirtualMachineSnapshot[]
  >({
    cluster,
    groupVersionKind: modelToGroupVersionKind(VirtualMachineSnapshotModel),
    isList: true,
    namespace,
    namespaced: true,
  });

  const [allSecrets, secretsLoaded, secretsError] = useK8sWatchData<IoK8sApiCoreV1Secret[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(SecretModel),
    isList: true,
    namespace,
    namespaced: true,
    optional: true,
  });

  const dataVolumes = useMemo(
    () => allDataVolumes?.filter((dv) => dvVolumeNames.includes(getName(dv))) ?? [],
    [allDataVolumes, dvVolumeNames],
  );

  const volumes = useMemo(() => {
    if (!isGarbageCollectorEnabled) return dataVolumes;

    const allVolumeNames = [...dvVolumeNames, ...pvcVolumeNames];
    const matchingPvcs = allPvcs?.filter((pvc) => allVolumeNames.includes(getName(pvc))) ?? [];
    const standalonePvcs = matchingPvcs.filter((pvc) => !findPVCOwner(pvc, dataVolumes));

    return [...dataVolumes, ...standalonePvcs];
  }, [allPvcs, dataVolumes, dvVolumeNames, isGarbageCollectorEnabled, pvcVolumeNames]);

  const snapshots = useMemo(
    () =>
      allSnapshots?.filter(
        (snapshot) =>
          snapshot?.metadata?.ownerReferences?.some(
            (ownerReference) => ownerReference?.name === vmName,
          ) || snapshot?.spec?.source?.name === vmName,
      ) ?? [],
    [allSnapshots, vmName],
  );

  const secrets = useMemo(() => {
    const found = allSecrets?.find((secret) => getName(secret) === dvSecretRef);
    return found ? [found] : [];
  }, [allSecrets, dvSecretRef]);

  return {
    error: dvError || pvcsError || snapshotsError || secretsError,
    loaded: cdiLoaded && dvLoaded && pvcsLoaded && snapshotsLoaded && secretsLoaded,
    secrets,
    snapshots,
    volumes,
  };
};

export default useDeleteVMResources;
