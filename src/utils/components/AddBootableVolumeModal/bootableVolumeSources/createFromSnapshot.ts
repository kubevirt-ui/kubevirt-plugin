import produce from 'immer';

import { DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

export type CreateSnapshotBootableVolumeArgs = {
  cluster?: string;
  draftDataSource: V1beta1DataSource;
  snapshotName?: string;
  snapshotNamespace?: string;
};

export const createSnapshotDataSource = async ({
  cluster,
  draftDataSource,
  snapshotName,
  snapshotNamespace,
}: CreateSnapshotBootableVolumeArgs): Promise<V1beta1DataSource> => {
  const dataSourceToCreate = produce(draftDataSource, (draftDS) => {
    draftDS.spec.source = {
      snapshot: {
        name: snapshotName,
        namespace: snapshotNamespace,
      },
    };
  });

  return kubevirtK8sCreate({
    cluster,
    data: dataSourceToCreate,
    model: DataSourceModel,
  });
};
