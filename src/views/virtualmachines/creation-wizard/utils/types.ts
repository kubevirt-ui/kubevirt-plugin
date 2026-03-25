import {
  V1beta1DataImportCron,
  V1beta1DataVolume,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  V1beta1VirtualMachineClusterInstancetype,
  V1beta1VirtualMachineClusterPreference,
  V1beta1VirtualMachineInstancetype,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { ClusterNamespacedResourceMap } from '@kubevirt-utils/resources/shared';

export type InstanceTypes = (
  | V1beta1VirtualMachineClusterInstancetype
  | V1beta1VirtualMachineInstancetype
)[];

export type UseInstanceTypeAndPreferencesValues = {
  allInstanceTypes: InstanceTypes;
  clusterInstanceTypes: V1beta1VirtualMachineClusterInstancetype[];
  loaded: boolean;
  loadError: any;
  preferences: V1beta1VirtualMachineClusterPreference[];
};

export type UseBootableVolumesValues = {
  bootableVolumes: BootableVolume[];
  dataImportCrons: V1beta1DataImportCron[];
  dvSources: ClusterNamespacedResourceMap<V1beta1DataVolume>;
  error: Error;
  loaded: boolean;
  pvcSources: ClusterNamespacedResourceMap<IoK8sApiCoreV1PersistentVolumeClaim>;
  volumeSnapshotSources: { [dataSourceName: string]: VolumeSnapshotKind };
};
