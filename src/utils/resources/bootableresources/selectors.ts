import {
  type V1beta1DataSource,
  type V1beta1DataVolume,
  type V1beta1DataVolumeSourcePVC,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';

export const getDataSourcePVCSource = (dataSource: V1beta1DataSource): V1beta1DataVolumeSourcePVC =>
  dataSource?.spec?.source?.pvc;

export const getDataSourcePVCName = (dataSource: V1beta1DataSource): string | undefined =>
  getDataSourcePVCSource(dataSource)?.name;

export const getDataSourcePVCNamespace = (dataSource: V1beta1DataSource): string | undefined =>
  getDataSourcePVCSource(dataSource)?.namespace;

export const getVolumeSnapshotSize = (volumeSnapshot: VolumeSnapshotKind): string | undefined =>
  volumeSnapshot?.status?.restoreSize;

export const getVolumeSnapshotStorageClass = (
  volumeSnapshot: VolumeSnapshotKind,
): string | undefined => volumeSnapshot?.spec?.volumeSnapshotClassName;

export const getPVCStorageCapacity = (
  pvc: IoK8sApiCoreV1PersistentVolumeClaim,
): string | undefined => pvc?.status?.capacity?.storage;

export const getPVCSize = (pvc: IoK8sApiCoreV1PersistentVolumeClaim): string | undefined =>
  pvc?.spec?.resources?.requests?.storage;

export const getPVCStorageClassName = (
  pvc: IoK8sApiCoreV1PersistentVolumeClaim,
): string | undefined => pvc?.spec?.storageClassName;

export const getDataVolumeSize = (dataVolume: V1beta1DataVolume): string | undefined =>
  dataVolume?.spec?.storage?.resources?.requests?.storage;

export const getDataVolumeStorageClassName = (dataVolume: V1beta1DataVolume): string | undefined =>
  dataVolume?.spec?.storage?.storageClassName;

export const getPhase = (
  volume: IoK8sApiCoreV1PersistentVolumeClaim | V1beta1DataVolume,
): string | undefined => volume?.status?.phase;

export const getDiskSize = (
  dataVolume: V1beta1DataVolume,
  pvc: IoK8sApiCoreV1PersistentVolumeClaim,
  volumeSnapshot: VolumeSnapshotKind,
): string | undefined =>
  getDataVolumeSize(dataVolume) ?? getPVCSize(pvc) ?? getVolumeSnapshotSize(volumeSnapshot);
