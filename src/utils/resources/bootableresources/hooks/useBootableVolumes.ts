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
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
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
  const [volumeSnapshots, loadedVolumeSnapshots, loadErrorVolumeSnapshots] = useK8sWatchResource<
    VolumeSnapshotKind[]
  >({
    groupVersionKind: modelToGroupVersionKind(VolumeSnapshotModel),
    isList: true,
    namespace,
  });

  const error = useMemo(
    () => dataSourcesError || loadErrorPVCs || loadErrorVolumeSnapshots,
    [dataSourcesError, loadErrorPVCs, loadErrorVolumeSnapshots],
  );

  const loaded = useMemo(
    () => (error ? true : loadedDataSources && loadedPVCs && loadedVolumeSnapshots),
    [error, loadedDataSources, loadedPVCs, loadedVolumeSnapshots],
  );

  const readyOrCloningDataSources = useMemo(
    () => getReadyOrCloningOrUploadingDataSources(dataSources),
    [dataSources],
  );
  const pvcSources = useMemo(() => convertResourceArrayToMap(pvcs, true), [pvcs]);

  // getting all underlying PVCs to get size and SC data from
  const pvcSourcesFromDS: IoK8sApiCoreV1PersistentVolumeClaim[] = useMemo(() => {
    return readyOrCloningDataSources?.map((ds) => {
      const { name, namespace: pvcNamespace } = ds?.spec?.source?.pvc || {};
      if (!isEmpty(pvcSources?.[pvcNamespace]?.[name])) {
        return pvcSources?.[pvcNamespace]?.[name];
      }
    });
  }, [pvcSources, readyOrCloningDataSources]);

  // getting PVCs with default preference label which doesn't have DS
  const labeledPVCs = useMemo(
    () =>
      pvcs?.filter((pvc) => {
        if (!isEmpty(pvc?.metadata?.labels?.[DEFAULT_PREFERENCE_LABEL])) {
          const existingPVC = pvcSourcesFromDS?.find((pvcSource) => isEqualObject(pvcSource, pvc));
          if (!existingPVC) return pvc;
        }
      }),
    [pvcSourcesFromDS, pvcs],
  );

  const bootableVolumes: BootableVolume[] = useMemo(() => {
    const dataSourceVolumes =
      loaded && !isEmpty(readyOrCloningDataSources) ? [...readyOrCloningDataSources] : [];
    const pvcVolumes = loaded && !isEmpty(labeledPVCs) ? [...labeledPVCs] : [];

    return [...dataSourceVolumes, ...pvcVolumes];
  }, [labeledPVCs, loaded, readyOrCloningDataSources]);

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
