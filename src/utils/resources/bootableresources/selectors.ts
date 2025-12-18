import {
  V1beta1DataSource,
  V1beta1DataVolume,
  V1beta1DataVolumeSourcePVC,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';

export const getDataSourcePVCSource = (dataSource: V1beta1DataSource): V1beta1DataVolumeSourcePVC =>
  dataSource?.spec?.source?.pvc;

export const getDataSourcePVCName = (dataSource: V1beta1DataSource) =>
  getDataSourcePVCSource(dataSource)?.name;

export const getDataSourcePVCNamespace = (dataSource: V1beta1DataSource) =>
  getDataSourcePVCSource(dataSource)?.namespace;

export const getVolumeSnapshotSize = (volumeSnapshot: VolumeSnapshotKind) =>
  volumeSnapshot?.status?.restoreSize;

export const getVolumeSnapshotStorageClass = (volumeSnapshot: VolumeSnapshotKind) =>
  volumeSnapshot?.spec?.volumeSnapshotClassName;

export const getPVCStorageCapacity = (pvc: IoK8sApiCoreV1PersistentVolumeClaim) =>
  pvc?.status?.capacity?.storage;

export const getPVCSize = (pvc: IoK8sApiCoreV1PersistentVolumeClaim) =>
  pvc?.spec?.resources?.requests?.storage;

export const getPVCStorageClassName = (pvc: IoK8sApiCoreV1PersistentVolumeClaim) =>
  pvc?.spec?.storageClassName;

export const getDataVolumeSize = (dataVolume: V1beta1DataVolume) =>
  dataVolume?.spec?.storage?.resources?.requests?.storage;

export const getDataVolumeStorageClassName = (dataVolume: V1beta1DataVolume) =>
  dataVolume?.spec?.storage?.storageClassName;

export const getPhase = (volume: IoK8sApiCoreV1PersistentVolumeClaim | V1beta1DataVolume) =>
  volume?.status?.phase;
