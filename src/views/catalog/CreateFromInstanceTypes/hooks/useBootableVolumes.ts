import { useMemo } from 'react';

import {
  DataSourceModelGroupVersionKind,
  modelToGroupVersionKind,
  PersistentVolumeClaimModel,
} from '@kubevirt-ui/kubevirt-api/console';
import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';
import { isEqualObject } from '@kubevirt-utils/components/NodeSelectorModal/utils/helpers';
import { KUBEVIRT_OS_IMAGES_NS, OPENSHIFT_OS_IMAGES_NS } from '@kubevirt-utils/constants/constants';
import {
  convertResourceArrayToMap,
  getReadyOrCloningOrUploadingDataSources,
} from '@kubevirt-utils/resources/shared';
import { isEmpty, isUpstream } from '@kubevirt-utils/utils/utils';
import { Operator, useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { BootableVolume, DEFAULT_PREFERENCE_LABEL } from '../utils/constants';

export type UseBootableVolumesValues = {
  bootableVolumes: BootableVolume[];
  loaded: boolean;
  loadError?: any;
  pvcSources: {
    [resourceKeyName: string]: IoK8sApiCoreV1PersistentVolumeClaim;
  };
};

type UseBootableVolumes = () => UseBootableVolumesValues;

const useBootableVolumes: UseBootableVolumes = () => {
  const [dataSources, loadedDataSources, loadErrorDataSources] = useK8sWatchResource<
    V1beta1DataSource[]
  >({
    groupVersionKind: DataSourceModelGroupVersionKind,
    isList: true,
    namespace: isUpstream ? KUBEVIRT_OS_IMAGES_NS : OPENSHIFT_OS_IMAGES_NS,
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
    namespace: isUpstream ? KUBEVIRT_OS_IMAGES_NS : OPENSHIFT_OS_IMAGES_NS,
  });

  const loadError = useMemo(
    () => loadErrorDataSources || loadErrorPVCs,
    [loadErrorDataSources, loadErrorPVCs],
  );

  const loaded = useMemo(
    () => (loadError ? true : loadedDataSources && loadedPVCs),
    [loadError, loadedDataSources, loadedPVCs],
  );

  const readyOrCloningDataSources = useMemo(
    () => getReadyOrCloningOrUploadingDataSources(dataSources),
    [dataSources],
  );
  const pvcSources = useMemo(() => convertResourceArrayToMap(pvcs, true), [pvcs]);

  // getting all underlying PVCs to get size and SC data from
  const pvcSourcesFromDS: IoK8sApiCoreV1PersistentVolumeClaim[] = useMemo(() => {
    return readyOrCloningDataSources?.map((ds) => {
      const { name, namespace } = ds?.spec?.source?.pvc || {};
      if (!isEmpty(pvcSources?.[namespace]?.[name])) {
        return pvcSources?.[namespace]?.[name];
      }
    });
  }, [pvcSources, readyOrCloningDataSources]);

  // getting PVCs with default preference label which doesn't have DS
  const labeledPVCs = useMemo(
    () =>
      pvcs?.filter((pvc) => {
        if (!isEmpty(pvc?.metadata?.labels[DEFAULT_PREFERENCE_LABEL])) {
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

  return {
    bootableVolumes,
    loaded,
    loadError,
    pvcSources,
  };
};

export default useBootableVolumes;
