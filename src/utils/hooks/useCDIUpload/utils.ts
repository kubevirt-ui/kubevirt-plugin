import { TFunction } from 'react-i18next';

import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { UploadTokenRequestModel } from '@kubevirt-utils/models';
import { getAPIVersionForModel } from '@kubevirt-utils/resources/shared';
import { getDataVolume } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { k8sCreate, k8sDelete, K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { ProgressVariant } from '@patternfly/react-core';

import { CDI_BIND_REQUESTED_ANNOTATION } from './consts';

export type CDIConfig = K8sResourceCommon & {
  status: {
    uploadProxyURL: string;
  };
};

type UploadToken = K8sResourceCommon & {
  status: {
    token?: string;
  };
};

export enum UPLOAD_STATUS {
  ALLOCATING = 'ALLOCATING',
  UPLOADING = 'UPLOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  CANCELED = 'CANCELED',
}

export const uploadStatusLabels = (t: TFunction) => ({
  [UPLOAD_STATUS.ALLOCATING]: t('Allocating resources, Please wait.'),
  [UPLOAD_STATUS.UPLOADING]: t('Uploading'),
  [UPLOAD_STATUS.SUCCESS]: t('Success'),
  [UPLOAD_STATUS.ERROR]: t('Error'),
  [UPLOAD_STATUS.CANCELED]: t('Canceled'),
});

export const uploadStatusToProgressVariant = {
  [UPLOAD_STATUS.SUCCESS]: ProgressVariant.success,
  [UPLOAD_STATUS.ERROR]: ProgressVariant.danger,
  [UPLOAD_STATUS.CANCELED]: ProgressVariant.danger,
};

const PVC_STATUS_DELAY = 2 * 1000;
const DV_UPLOAD_STATES = {
  SCHEDULED: 'UploadScheduled',
  READY: 'UploadReady',
};

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getUploadProxyURL = (config: CDIConfig) => config?.status?.uploadProxyURL;

export const getUploadURL = (uploadProxyURL: string) =>
  `https://${uploadProxyURL}/v1beta1/upload-form-async`;

export const killUploadPVC = async (name: string, namespace: string) => {
  await k8sDelete({ model: DataVolumeModel, resource: { metadata: { name, namespace } } });
};

const waitForUploadReady = async (dataVolume: V1beta1DataVolume, counter = 30) => {
  let dv = dataVolume;
  for (let i = 0; i < counter; i++) {
    if (dv?.status?.phase === DV_UPLOAD_STATES.READY) {
      return true;
    }
    await delay(PVC_STATUS_DELAY);
    dv = await getDataVolume(dataVolume?.metadata?.name, dataVolume?.metadata?.namespace);
  }

  throw new PVCInitError();
};

const createUploadToken = async (pvcName: string, namespace: string): Promise<string> => {
  const tokenRequest = {
    apiVersion: getAPIVersionForModel(UploadTokenRequestModel),
    kind: UploadTokenRequestModel.kind,
    metadata: {
      name: pvcName,
      namespace,
    },
    spec: {
      pvcName,
    },
    status: {},
  };

  try {
    const resource = await k8sCreate<UploadToken>({
      model: UploadTokenRequestModel,
      data: tokenRequest,
    });
    return resource?.status?.token;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const createUploadPVC = async (dataVolume: V1beta1DataVolume) => {
  const dvName = dataVolume?.metadata?.name;
  const namespace = dataVolume?.metadata?.namespace;

  dataVolume.metadata = dataVolume?.metadata || {};
  dataVolume.metadata.annotations = {
    ...(dataVolume?.metadata?.annotations || {}),
    [CDI_BIND_REQUESTED_ANNOTATION]: 'true',
  };

  try {
    const dv = await k8sCreate({ model: DataVolumeModel, data: dataVolume });
    await waitForUploadReady(dv);
    const token = await createUploadToken(dvName, namespace);

    return { token };
  } catch (error) {
    if (error instanceof PVCInitError) {
      throw new PVCInitError();
    }
    throw new Error(error.message);
  }
};

export class PVCInitError extends Error {
  constructor() {
    // t('Data Volume failed to initiate upload.')
    super('Data Volume failed to initiate upload.');
  }
}
