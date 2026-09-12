import { type TFunction } from 'i18next';
import produce from 'immer';

import { DataSourceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataSource } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type UploadDataProps } from '@kubevirt-utils/hooks/useCDIUpload/types';
import {
  completeBootableVolumeUpload,
  failBootableVolumeUpload,
} from '@kubevirt-utils/hooks/useUploadProgressToast/completion/uploadCompletion';
import { getBootableVolumeUploadKey } from '@kubevirt-utils/hooks/useUploadProgressToast/keys/uploadKeys';
import { KUBEVIRT_ISO_LABEL } from '@kubevirt-utils/resources/bootableresources/constants';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';

import { type AddBootableVolumeState } from '../types';

import { getDataVolumeWithSource } from './dataVolumeHelpers';

export const createBootableVolumeFromUpload = async (
  bootableVolume: AddBootableVolumeState,
  namespace: string,
  draftDataSource: V1beta1DataSource,
  uploadData: ({ dataVolume, file }: UploadDataProps) => Promise<void>,
  t: TFunction,
  onUploadStart?: (uploadKey: string) => void,
): Promise<V1beta1DataSource> => {
  const { isIso, uploadFile } = bootableVolume || {};
  const updatedNameBootableVolume = produce(bootableVolume, (draft) => {
    draft.bootableVolumeName = draftDataSource.metadata.name;
  });
  const bootableVolumeToCreate = getDataVolumeWithSource(updatedNameBootableVolume, namespace, {
    upload: {},
  });

  const dataSourceToCreate = produce(draftDataSource, (draftDS) => {
    if (isIso) {
      draftDS.metadata.labels = {
        ...(draftDS.metadata.labels ?? {}),
        [KUBEVIRT_ISO_LABEL]: 'true',
      };
    }
    draftDS.spec.source = {
      pvc: {
        name: getName(bootableVolumeToCreate),
        namespace: getNamespace(bootableVolumeToCreate),
      },
    };
  });

  const volumeName = getName(dataSourceToCreate);
  const volumeNamespace = getNamespace(dataSourceToCreate);
  const uploadKey = getBootableVolumeUploadKey(volumeNamespace, volumeName);

  onUploadStart?.(uploadKey);

  await uploadData({
    dataVolume: bootableVolumeToCreate,
    file: uploadFile as File,
    uploadKey,
    uploadTrackMetadata: {
      dvCluster: bootableVolume.bootableVolumeCluster,
      dvName: getName(bootableVolumeToCreate),
      dvNamespace: getNamespace(bootableVolumeToCreate),
      resourceName: volumeName,
    },
  });

  try {
    const createdDataSource = await kubevirtK8sCreate({
      cluster: bootableVolume.bootableVolumeCluster,
      data: dataSourceToCreate,
      model: DataSourceModel,
    });

    completeBootableVolumeUpload({ dataSource: createdDataSource, t, uploadKey });

    return createdDataSource;
  } catch (error) {
    failBootableVolumeUpload(uploadKey, error);
    throw error;
  }
};
