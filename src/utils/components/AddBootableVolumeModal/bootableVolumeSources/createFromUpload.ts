import { type TFunction } from 'i18next';
import produce from 'immer';

import { DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type CdiUploadDataFn } from '@kubevirt-utils/hooks/useCDIUpload/types';
import {
  completeBootableVolumeUpload,
  failBootableVolumeUpload,
} from '@kubevirt-utils/hooks/useInFlightToast/completion/uploadCompletion';
import { getBootableVolumeContextLink } from '@kubevirt-utils/hooks/useInFlightToast/completion/uploadLinks';
import { getBootableVolumeUploadKey } from '@kubevirt-utils/hooks/useInFlightToast/keys/uploadKeys';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

import { type DataVolumeSpecFields, getDataVolumeWithSource } from './dataVolumeHelpers';

export type CreateUploadBootableVolumeArgs = {
  cluster?: string;
  dataVolume: DataVolumeSpecFields;
  draftDataSource: V1beta1DataSource;
  namespace: string;
  onUploadStart?: (uploadKey: string) => void;
  t: TFunction;
  uploadData: CdiUploadDataFn;
  uploadFile?: File | string;
};

export const createBootableVolumeFromUpload = async ({
  cluster,
  dataVolume,
  draftDataSource,
  namespace,
  onUploadStart,
  t,
  uploadData,
  uploadFile,
}: CreateUploadBootableVolumeArgs): Promise<V1beta1DataSource> => {
  const bootableVolumeToCreate = getDataVolumeWithSource(dataVolume, namespace, { upload: {} });

  const dataSourceToCreate = produce(draftDataSource, (draftDS) => {
    draftDS.spec.source = {
      pvc: {
        name: getName(bootableVolumeToCreate),
        namespace: getNamespace(bootableVolumeToCreate),
      },
    };
  });

  const volumeName = getName(dataSourceToCreate);
  const volumeNamespace = getNamespace(dataSourceToCreate);
  const uploadKey = getBootableVolumeUploadKey(volumeNamespace, volumeName, cluster);

  onUploadStart?.(uploadKey);

  const expectedGeneration = await uploadData({
    dataVolume: bootableVolumeToCreate,
    file: uploadFile as File,
    uploadKey,
    uploadTrackMetadata: {
      contextLinks: [
        getBootableVolumeContextLink(t, volumeName ?? '', volumeNamespace ?? namespace, cluster),
      ],
      dvCluster: cluster,
      dvName: getName(bootableVolumeToCreate),
      dvNamespace: getNamespace(bootableVolumeToCreate),
      resourceName: volumeName,
    },
  });

  try {
    const createdDataSource = await kubevirtK8sCreate({
      cluster,
      data: dataSourceToCreate,
      model: DataSourceModel,
    });

    completeBootableVolumeUpload({
      dataSource: createdDataSource,
      expectedGeneration,
      t,
      uploadKey,
    });

    return createdDataSource;
  } catch (error) {
    failBootableVolumeUpload(uploadKey, error, expectedGeneration);
    throw error;
  }
};
