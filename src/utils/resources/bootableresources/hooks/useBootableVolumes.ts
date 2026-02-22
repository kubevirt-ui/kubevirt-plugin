import { useMemo } from 'react';

import { UseBootableVolumesValues } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import {
  DataSourceModelGroupVersionKind,
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
  VolumeSnapshotModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { DataImportCronModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import {
  V1beta1DataImportCron,
  V1beta1DataSource,
  V1beta1DataVolume,
} from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { ALL_PROJECTS } from '@kubevirt-utils/hooks/constants';
import useKubevirtWatchResource from '@kubevirt-utils/hooks/useKubevirtWatchResource/useKubevirtWatchResource';
import useListMulticlusterFilters from '@kubevirt-utils/hooks/useListMulticlusterFilters';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import {
  convertResourceArrayToMapWithCluster,
  getName,
  getNamespace,
  getReadyOrCloningOrUploadingDataSources,
} from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import useClusterParam from '@multicluster/hooks/useClusterParam';
import { Operator } from '@openshift-console/dynamic-plugin-sdk';

type UseBootableVolumes = (namespace?: string) => UseBootableVolumesValues;

const useBootableVolumes: UseBootableVolumes = (namespace) => {
  const projectsNamespace = namespace === ALL_PROJECTS ? null : namespace;
  const cluster = useClusterParam();

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

  // DataSources being provisioned by a DataVolume that don't yet match the
  // ready/cloning/uploading filters (e.g. freshly created DS before CDI
  // updates its status conditions).
  const provisioningDataSources = useMemo(() => {
    if (!loaded || isEmpty(dataSources) || isEmpty(dvs)) return [];

    const readyOrCloningKeys = new Set(
      readyOrCloningDataSources.map((ds) => `${getNamespace(ds)}/${getName(ds)}`),
    );

    return dataSources.filter((ds) => {
      if (readyOrCloningKeys.has(`${getNamespace(ds)}/${getName(ds)}`)) return false;

      return dvs.some((dv) => getName(dv) === getName(ds) && getNamespace(dv) === getNamespace(ds));
    });
  }, [loaded, dataSources, dvs, readyOrCloningDataSources]);

  const bootableVolumes: BootableVolume[] = useMemo(() => {
    if (!loaded) return [];

    return [...readyOrCloningDataSources, ...provisioningDataSources];
  }, [loaded, readyOrCloningDataSources, provisioningDataSources]);

  const volumeSnapshotSources = useMemo(
    () =>
      dataSources.reduce((acc, ds) => {
        if (ds?.spec?.source?.snapshot?.name) {
          const matchedVolumeSnapshot = volumeSnapshots.find(
            (volume) => volume.metadata.name === ds?.spec?.source?.snapshot?.name,
          );
          acc[ds.metadata.name] = matchedVolumeSnapshot;
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
