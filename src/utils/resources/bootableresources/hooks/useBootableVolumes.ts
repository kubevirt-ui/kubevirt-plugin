import { useMemo } from 'react';

import { UseBootableVolumesValues } from '@catalog/CreateFromInstanceTypes/state/utils/types';
import { DEFAULT_PREFERENCE_LABEL } from '@catalog/CreateFromInstanceTypes/utils/constants';
import {
  DataSourceModelGroupVersionKind,
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
  VolumeSnapshotModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { VolumeSnapshotKind } from '@kubevirt-utils/components/SelectSnapshot/types';
import { BootableVolume } from '@kubevirt-utils/resources/bootableresources/types';
import {
  convertResourceArrayToMap,
  getReadyOrCloningOrUploadingDataSources,
} from '@kubevirt-utils/resources/shared';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { Operator, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UseBootableVolumes = (namespace?: string) => UseBootableVolumesValues;

const useBootableVolumes: UseBootableVolumes = (namespace) => {
  const [dataSources, loadedDataSources, dataSourcesError] = useK8sWatchResource<
    V1beta1DataSource[]
  >({
    groupVersionKind: DataSourceModelGroupVersionKind,
    isList: true,
    namespace,
    selector: {
      matchExpressions: [{ key: DEFAULT_PREFERENCE_LABEL, operator: Operator.Exists }],
    },
  });

  // getting all pvcs since there could be a case where a DS has the label and it's underlying PVC does not
  const [pvcs, loadedPVCs, loadErrorPVCs] = useK8sWatchResource<
    IoK8sApiCoreV1PersistentVolumeClaim[]
  >({
    groupVersionKind: modelToGroupVersionKind(PersistentVolumeClaimModel),
    isList: true,
    namespace,
  });

  // getting volumesnapshot as this can also be a source of DS
  const [volumeSnapshots] = useK8sWatchResource<VolumeSnapshotKind[]>({
    groupVersionKind: modelToGroupVersionKind(VolumeSnapshotModel),
    isList: true,
    namespace,
  });

  const error = useMemo(() => dataSourcesError || loadErrorPVCs, [dataSourcesError, loadErrorPVCs]);

  const loaded = useMemo(
    () => (error ? true : loadedDataSources && loadedPVCs),
    [error, loadedDataSources, loadedPVCs],
  );

  const readyOrCloningDataSources = useMemo(
    () => getReadyOrCloningOrUploadingDataSources(dataSources),
    [dataSources],
  );
  const pvcSources = useMemo(() => convertResourceArrayToMap(pvcs, true), [pvcs]);

  const bootableVolumes: BootableVolume[] = useMemo(() => {
    const dataSourceVolumes =
      loaded && !isEmpty(readyOrCloningDataSources) ? [...readyOrCloningDataSources] : [];

    return dataSourceVolumes;
  }, [loaded, readyOrCloningDataSources]);

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
    error,
    loaded,
    pvcSources,
    volumeSnapshotSources,
  };
};

export default useBootableVolumes;
