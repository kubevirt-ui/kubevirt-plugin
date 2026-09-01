import {
  type V1beta1DataImportCron,
  type V1beta1DataVolume,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import {
  type V1beta1VirtualMachineClusterPreference,
  type V1beta1VirtualMachinePreference,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { type PreferenceOption } from '@kubevirt-utils/components/AddBootableVolumeModal/types';
import { type VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { type TableColumnWithOptionalIndex } from '@kubevirt-utils/hooks/useKubevirtUserSettings/useKubevirtUserSettingsTableColumns';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import { type VirtualMachinePreference } from '@kubevirt-utils/resources/preference/types';
import {
  type ClusterNamespacedResourceMap,
  type NamespacedResourceMap,
  type ResourceMap,
} from '@kubevirt-utils/resources/shared';
import {
  type OnSelectBootableVolume,
  type UseBootableVolumesValues,
  type UseInstanceTypeAndPreferencesValues,
} from '@virtualmachines/wizard/utils/types';

export type { TableColumnWithOptionalIndex };

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
  dataImportCron: undefined | V1beta1DataImportCron;
  dvSource: null | undefined | V1beta1DataVolume;
  preference: undefined | VirtualMachinePreference;
  pvcSource: IoK8sApiCoreV1PersistentVolumeClaim | null;
  volumeListNamespace: string;
  volumeSnapshotSource: undefined | VolumeSnapshotKind;
};

export type BootableVolumeListProps = {
  bootableVolumesData: UseBootableVolumesValues;
  canCreateVolume: boolean;
  cluster?: string;
  instanceTypesAndPreferencesData: UseInstanceTypeAndPreferencesValues;
  loadError?: Error;
  lockedPreference?: PreferenceOption;
  onCreateVolume: (volume: BootableVolume) => void;
  onSelectBootableVolume: OnSelectBootableVolume;
  onVolumeListNamespaceChange: (namespace: string) => void;
  preferenceName?: string;
  selectedBootableVolume?: BootableVolume;
  showNoBootSourceHint?: boolean;
  syncFiltersWithURL?: boolean;
  volumeListNamespace: string;
};
