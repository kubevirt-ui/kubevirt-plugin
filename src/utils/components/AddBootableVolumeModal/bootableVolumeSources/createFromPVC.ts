import produce from 'immer';

import { DataSourceModel, DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtK8sCreate, kubevirtK8sDelete } from '@multicluster/k8sRequests';

import { type DataVolumeSpecFields, getDataVolumeWithSource } from './dataVolumeHelpers';

export type CreatePVCBootableVolumeArgs = {
  cluster?: string;
  dataVolume: DataVolumeSpecFields;
  draftDataSource: V1beta1DataSource;
  namespace: string;
  pvcName: string;
  pvcNamespace: string;
};

export const createPVCBootableVolume = async ({
  cluster,
  dataVolume,
  draftDataSource,
  namespace,
  pvcName,
  pvcNamespace,
}: CreatePVCBootableVolumeArgs): Promise<V1beta1DataSource> => {
  const bootableVolumeToCreate = getDataVolumeWithSource(dataVolume, namespace, {
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
    cluster,
    data: dataSourceToCreate,
    model: DataSourceModel,
  });

  try {
    await kubevirtK8sCreate({
      cluster,
      data: bootableVolumeToCreate,
      model: DataVolumeModel,
    });
  } catch (error) {
    await Promise.allSettled([
      kubevirtK8sDelete({
        cluster,
        model: DataSourceModel,
        resource: createdDS,
      }),
    ]);
    throw error;
  }
  return createdDS;
};
