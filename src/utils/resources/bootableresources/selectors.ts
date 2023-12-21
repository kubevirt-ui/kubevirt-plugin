import {
  V1beta1DataSource,
  V1beta1DataVolumeSourcePVC,
} from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';

export const getDataSourcePVCSource = (dataSource: V1beta1DataSource): V1beta1DataVolumeSourcePVC =>
  dataSource?.spec?.source?.pvc;

export const getVolumeSnapshotSize = (volumeSnapshot: VolumeSnapshotKind) =>
  volumeSnapshot?.status?.restoreSize;

export const getVolumeSnapshotStorageClass = (volumeSnapshot: VolumeSnapshotKind) =>
  volumeSnapshot?.spec?.volumeSnapshotClassName;
