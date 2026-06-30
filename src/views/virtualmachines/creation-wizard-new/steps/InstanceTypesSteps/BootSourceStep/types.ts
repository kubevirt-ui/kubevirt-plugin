import {
  V1beta1DataImportCron,
  V1beta1DataVolume,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { VirtualMachinePreference } from '@kubevirt-utils/resources/preference/types';
import {
  ClusterNamespacedResourceMap,
  NamespacedResourceMap,
  ResourceMap,
} from '@kubevirt-utils/resources/shared';
import { TableColumn } from '@openshift-console/dynamic-plugin-sdk';

export type TableColumnWithOptionalIndex<T> = TableColumn<T> & { columnIndex?: number };

export type BootableVolumeSortContext = {
  clusterPreferencesMap: ResourceMap<V1beta1VirtualMachineClusterPreference>;
  dvSources: ClusterNamespacedResourceMap<V1beta1DataVolume>;
  includeNamespaceColumn: boolean;
  pvcSources: ClusterNamespacedResourceMap<IoK8sApiCoreV1PersistentVolumeClaim>;
  userPreferencesMap: NamespacedResourceMap<V1beta1VirtualMachinePreference>;
  volumeSnapshotSources: {
    [dataSourceName: string]: VolumeSnapshotKind;
  };
};

export type BootableVolumeResolvedSources = {
  dvSource: V1beta1DataVolume;
  pvcSource: IoK8sApiCoreV1PersistentVolumeClaim;
  volumeSnapshotSource: VolumeSnapshotKind;
};

export type BootableVolumeRowData = {
  dataImportCron: V1beta1DataImportCron;
  dvSource: V1beta1DataVolume;
  preference: VirtualMachinePreference;
  pvcSource: IoK8sApiCoreV1PersistentVolumeClaim;
  volumeListNamespace: string;
  volumeSnapshotSource: VolumeSnapshotKind;
};
