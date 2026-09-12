import produce from 'immer';

import { DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

import { type AddBootableVolumeState } from '../types';

export const createSnapshotDataSource = async (
  bootableVolume: AddBootableVolumeState,
  draftDataSource: V1beta1DataSource,
): Promise<V1beta1DataSource> => {
  const dataSourceToCreate = produce(draftDataSource, (draftDS) => {
    draftDS.spec.source = {
      snapshot: {
        name: bootableVolume.snapshotName,
        namespace: bootableVolume.snapshotNamespace,
      },
    };
  });

  return kubevirtK8sCreate({ data: dataSourceToCreate, model: DataSourceModel });
};
