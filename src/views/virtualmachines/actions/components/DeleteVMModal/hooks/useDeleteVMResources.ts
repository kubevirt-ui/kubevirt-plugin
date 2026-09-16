import { useMemo } from 'react';

import { modelToGroupVersionKind, SecretModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachineSnapshotModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type IoK8sApiCoreV1Secret } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  type V1beta1VirtualMachineSnapshot,
  type V1VirtualMachine,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getRootDiskSecretRef, getVolumes } from '@kubevirt-utils/resources/vm';
import { getCluster } from '@multicluster/helpers/selectors';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

type UseDeleteVMResourcesResult = {
  error: Error;
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

  const vmVolumes = useMemo(() => getVolumes(vm) ?? [], [vm]);

  const dvVolumeNames = useMemo(
    () => vmVolumes.filter((volume) => volume?.dataVolume).map((volume) => volume.dataVolume.name),
    [vmVolumes],
  );

  const [allDataVolumes, dvLoaded, dvError] = useK8sWatchData<V1beta1DataVolume[]>({
    cluster,
    groupVersionKind: modelToGroupVersionKind(DataVolumeModel),
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

  const volumes = useMemo(
    () => allDataVolumes?.filter((dataVolume) => dvVolumeNames.includes(getName(dataVolume))) ?? [],
    [allDataVolumes, dvVolumeNames],
  );

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
    error: dvError || snapshotsError || secretsError,
    loaded: dvLoaded && snapshotsLoaded && secretsLoaded,
    secrets,
    snapshots,
    volumes,
  };
};

export default useDeleteVMResources;
