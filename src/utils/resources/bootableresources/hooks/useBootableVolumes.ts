import { useMemo } from 'react';

import {
  DataImportCronModel,
  DataSourceModelGroupVersionKind,
  DataVolumeModel,
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
  VolumeSnapshotModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  type V1beta1DataImportCron,
  type V1beta1DataSource,
  type V1beta1DataVolume,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { type VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { DEFAULT_PREFERENCE_LABEL } from '@kubevirt-utils/constants/instancetypes-and-preferences';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useListMulticlusterFilters from '@kubevirt-utils/hooks/useListMulticlusterFilters';
import { getProvisioningDataSources } from '@kubevirt-utils/resources/bootableresources/hooks/getProvisioningDataSources';
import { type BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import {
  convertResourceArrayToMapWithCluster,
  getReadyOrCloningOrUploadingDataSources,
} from '@kubevirt-utils/resources/shared';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { Operator } from '@openshift-console/dynamic-plugin-sdk';
import { type UseBootableVolumesValues } from '@virtualmachines/wizard/utils/types';

type UseBootableVolumes = (
  namespace?: string,
  clusterOverride?: string,
) => UseBootableVolumesValues;

const useBootableVolumes: UseBootableVolumes = (namespace, clusterOverride) => {
  const projectsNamespace = namespace === ALL_PROJECTS ? null : namespace;
  const clusterParam = useClusterParam();
  const cluster = clusterOverride ?? clusterParam;

  const multiclusterFilters = useListMulticlusterFilters();

  const [dataSources, loadedDataSources, dataSourcesError] = useKubevirtWatchResource<
    V1beta1DataSource[]
  >(
    {
      cluster,
      groupVersionKind: DataSourceModelGroupVersionKind,
      isList: true,
      namespace: projectsNamespace,
      selector: {
        matchExpressions: [{ key: DEFAULT_PREFERENCE_LABEL, operator: Operator.Exists }],
      },
    },
    null,
    multiclusterFilters,
  );

  const [dataImportCrons, loadedDataImportCrons, dataImportCronsError] = useKubevirtWatchResource<
    V1beta1DataImportCron[]
  >(
    {
      cluster,
      groupVersionKind: modelToGroupVersionKind(DataImportCronModel),
      isList: true,
      namespace: projectsNamespace,
    },
    null,
    multiclusterFilters,
  );

  // getting all pvcs since there could be a case where a DS has the label and it's underlying PVC does not
  const [pvcs, loadedPVCs, loadErrorPVCs] = useKubevirtWatchResource<
    IoK8sApiCoreV1PersistentVolumeClaim[]
  >(
    {
      cluster,
      groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
      isList: true,
      namespace: projectsNamespace,
    },
    null,
    multiclusterFilters,
  );

  const [dvs, loadedDVs, loadErrorDVs] = useKubevirtWatchResource<V1beta1DataVolume[]>(
    {
      cluster,
      groupVersionKind: modelToGroupVersionKind(DataVolumeModel),
      isList: true,
      namespace: projectsNamespace,
    },
    null,
    multiclusterFilters,
  );

  // getting volumesnapshot as this can also be a source of DS
  const [volumeSnapshots] = useKubevirtWatchResource<VolumeSnapshotKind[]>(
    {
      cluster,
      groupVersionKind: modelToGroupVersionKind(VolumeSnapshotModel),
      isList: true,
      namespace: projectsNamespace,
    },
    null,
    multiclusterFilters,
  );

  const error = useMemo(
    () => dataSourcesError || loadErrorDVs || loadErrorPVCs || dataImportCronsError,
    [dataSourcesError, loadErrorDVs, loadErrorPVCs, dataImportCronsError],
  );

  const loaded = useMemo(
    () => (error ? true : loadedDataSources && loadedDVs && loadedPVCs && loadedDataImportCrons),
    [error, loadedDataSources, loadedDVs, loadedPVCs, loadedDataImportCrons],
  );

  const readyOrCloningDataSources = useMemo(
    () => getReadyOrCloningOrUploadingDataSources(dataSources, dataImportCrons),
    [dataSources, dataImportCrons],
  );
  const pvcSources = useMemo(() => convertResourceArrayToMapWithCluster(pvcs, true), [pvcs]);
  const dvSources = useMemo(() => convertResourceArrayToMapWithCluster(dvs, true), [dvs]);

  const provisioningDataSources = useMemo(() => {
    if (!loaded) return [];
    return getProvisioningDataSources(dataSources, dvs, readyOrCloningDataSources);
  }, [loaded, dataSources, dvs, readyOrCloningDataSources]);

  const bootableVolumes: BootableVolume[] = useMemo(() => {
    if (!loaded) return [];

    return [...readyOrCloningDataSources, ...provisioningDataSources];
  }, [loaded, readyOrCloningDataSources, provisioningDataSources]);

  const volumeSnapshotSources = useMemo(
    () =>
      dataSources.reduce((acc, dataSource) => {
        if (dataSource?.spec?.source?.snapshot?.name) {
          const matchedVolumeSnapshot = volumeSnapshots.find(
            (volume) => volume.metadata.name === dataSource?.spec?.source?.snapshot?.name,
          );
          acc[dataSource.metadata.name] = matchedVolumeSnapshot;
        }

        return acc;
      }, {}),
    [volumeSnapshots, dataSources],
  );

  return {
    bootableVolumes,
    dataImportCrons,
    dvSources,
    error,
    loaded,
    pvcSources,
    volumeSnapshotSources,
  };
};

export default useBootableVolumes;
