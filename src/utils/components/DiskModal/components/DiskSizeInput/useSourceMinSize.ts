import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import {
  DataSourceModelGroupVersionKind,
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
  VolumeSnapshotModel,
} from '@kubevirt-utils/models';
import {
  getPVCSize,
  getVolumeSnapshotSize,
} from '@kubevirt-utils/resources/bootableresources/selectors';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import useK8sWatchData from '@multicluster/hooks/useK8sWatchData';

import { type V1DiskFormState } from '../../utils/types';
import { getSourcePVCAndSnapshotIdentifiers } from './utils';

const useSourceMinSize = (diskState: V1DiskFormState, namespace: string): string | undefined => {
  const clusterFromUrl = useClusterParam();
  const cluster = diskState?.cluster ?? clusterFromUrl ?? undefined;

  const sourceRef = diskState?.dataVolumeTemplate?.spec?.sourceRef;

  const [dataSource] = useK8sWatchData<V1beta1DataSource>(
    sourceRef?.name
      ? {
          cluster,
          groupVersionKind: DataSourceModelGroupVersionKind,
          name: sourceRef.name,
          namespace: sourceRef.namespace,
        }
      : null,
  );

  const { pvcName, pvcNamespace, snapName, snapNamespace } = getSourcePVCAndSnapshotIdentifiers(
    diskState,
    dataSource,
    namespace,
  );

  const [pvc] = useK8sWatchData<IoK8sApiCoreV1PersistentVolumeClaim>(
    pvcName
      ? {
          cluster,
          groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
          name: pvcName,
          namespace: pvcNamespace,
        }
      : null,
  );

  const [volumeSnapshot] = useK8sWatchData<VolumeSnapshotKind>(
    snapName
      ? {
          cluster,
          groupVersionKind: modelToGroupVersionKind(VolumeSnapshotModel),
          name: snapName,
          namespace: snapNamespace,
        }
      : null,
  );

  return getPVCSize(pvc) ?? getVolumeSnapshotSize(volumeSnapshot);
};

export default useSourceMinSize;
