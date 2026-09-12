import produce from 'immer';

import { DataSourceModel, DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtK8sCreate, kubevirtK8sDelete } from '@multicluster/k8sRequests';

import { type AddBootableVolumeState } from '../types';

import { getDataVolumeWithSource } from './dataVolumeHelpers';

export const createPVCBootableVolume = async (
  bootableVolume: AddBootableVolumeState,
  namespace: string,
  draftDataSource: V1beta1DataSource,
): Promise<V1beta1DataSource> => {
  const { pvcName, pvcNamespace } = bootableVolume || {};

  const updatedNameBootableVolume = produce(bootableVolume, (draft) => {
    draft.bootableVolumeName = draftDataSource.metadata.name;
  });

  const bootableVolumeToCreate = getDataVolumeWithSource(updatedNameBootableVolume, namespace, {
    pvc: { name: pvcName, namespace: pvcNamespace },
  });

  const dataSourceToCreate = produce(draftDataSource, (draftDS) => {
    draftDS.spec.source = {
      pvc: {
        name: getName(bootableVolumeToCreate),
        namespace: getNamespace(bootableVolumeToCreate),
      },
    };
  });

  const createdDS = await kubevirtK8sCreate({
    cluster: bootableVolume.bootableVolumeCluster,
    data: dataSourceToCreate,
    model: DataSourceModel,
  });

  try {
    await kubevirtK8sCreate({
      cluster: bootableVolume.bootableVolumeCluster,
      data: bootableVolumeToCreate,
      model: DataVolumeModel,
    });
  } catch (error) {
    void kubevirtK8sDelete({
      cluster: bootableVolume.bootableVolumeCluster,
      model: DataSourceModel,
      resource: createdDS,
    });
    throw error;
  }
  return createdDS;
};
