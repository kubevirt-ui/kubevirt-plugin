import { TFunction } from 'react-i18next';
import produce from 'immer';

import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { PersistentVolumeClaimModel, UploadTokenRequestModel } from '@kubevirt-utils/models';
import { buildOwnerReference, getAPIVersionForModel } from '@kubevirt-utils/resources/shared';
import {
  getDataVolume,
  getPVC,
} from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import {
  k8sCreate,
  k8sDelete,
  k8sPatch,
  K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';
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
  CANCELED = 'CANCELED',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  UPLOADING = 'UPLOADING',
}

export const uploadStatusLabels = (t: TFunction) => ({
  [UPLOAD_STATUS.ALLOCATING]: t('Allocating resources, please wait for upload to start.'),
  [UPLOAD_STATUS.CANCELED]: t('Canceled'),
  [UPLOAD_STATUS.ERROR]: t('Error'),
  [UPLOAD_STATUS.SUCCESS]: t('Success'),
  [UPLOAD_STATUS.UPLOADING]: t('Uploading'),
});

export const uploadStatusToProgressVariant = {
  [UPLOAD_STATUS.CANCELED]: ProgressVariant.warning,
  [UPLOAD_STATUS.ERROR]: ProgressVariant.danger,
  [UPLOAD_STATUS.SUCCESS]: ProgressVariant.success,
};

const PVC_STATUS_DELAY = 2 * 1000;
const DV_UPLOAD_STATES = {
  READY: 'UploadReady',
  SCHEDULED: 'UploadScheduled',
};

export class PVCInitError extends Error {
  constructor() {
    // t('Data Volume failed to initiate upload.')
    super('Data Volume failed to initiate upload.');
  }
}

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getUploadProxyURL = (config: CDIConfig) => config?.status?.uploadProxyURL;

export const getUploadURL = (uploadProxyURL: string) =>
  `https://${uploadProxyURL}/v1beta1/upload-form-async`;

export const killUploadPVC = async (name: string, namespace: string) => {
  return k8sDelete({ model: DataVolumeModel, resource: { metadata: { name, namespace } } });
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
      data: tokenRequest,
      model: UploadTokenRequestModel,
    });
    return resource?.status?.token;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const createUploadPVC = async (dataVolume: V1beta1DataVolume) => {
  const dvName = dataVolume?.metadata?.name;
  const namespace = dataVolume?.metadata?.namespace;

  const updatedDataVolume = produce(dataVolume, (dvDraft) => {
    dvDraft.metadata.annotations = {
      ...(dvDraft.metadata.annotations || {}),
      [CDI_BIND_REQUESTED_ANNOTATION]: 'true',
    };
  });

  try {
    const dv = await k8sCreate({ data: updatedDataVolume, model: DataVolumeModel });
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

/**
 * while in wizard, the vm is not yet created so we wait for it to be created before adding ownerReference
 * @param vm - VirtualMachine
 * @param dataVolume - DataVolume
 * @returns - Promise
 */
export const addUploadDataVolumeOwnerReference = (
  vm: V1VirtualMachine,
  dataVolume: V1beta1DataVolume,
) => {
  // Since DV is GC we want underlying PVC to get ownerReference and to be associated with VM parent
  return getPVC(dataVolume?.metadata?.name, dataVolume?.metadata?.namespace)
    .then((pvc) =>
      k8sPatch({
        data: [
          {
            op: 'replace',
            path: '/metadata/ownerReferences',
            value: [
              ...(pvc?.metadata?.ownerReferences || []),
              buildOwnerReference(vm, { blockOwnerDeletion: false }),
            ],
          },
        ],
        model: PersistentVolumeClaimModel,
        resource: pvc,
      }),
    )
    .catch(() => Promise.resolve());
};
