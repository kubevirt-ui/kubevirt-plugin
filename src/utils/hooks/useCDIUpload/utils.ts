import produce from 'immer';

import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { V1beta1DataVolume } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { V1VirtualMachine } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { PersistentVolumeClaimModel, UploadTokenRequestModel } from '@kubevirt-utils/models';
import {
  buildOwnerReference,
  getAPIVersionForModel,
  getName,
  getNamespace,
} from '@kubevirt-utils/resources/shared';
import {
  getDataVolume,
  getPVC,
} from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate, kubevirtK8sDelete, kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { ProgressVariant } from '@patternfly/react-core';

import { t } from '../useKubevirtTranslation';

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

export const UPLOAD_STATUS_LABELS = {
  [UPLOAD_STATUS.ALLOCATING]: t('Allocating resources, please wait for upload to start.'),
  [UPLOAD_STATUS.CANCELED]: t('Canceled'),
  [UPLOAD_STATUS.ERROR]: t('Error'),
  [UPLOAD_STATUS.SUCCESS]: t('Success'),
  [UPLOAD_STATUS.UPLOADING]: t('Uploading'),
};

export const uploadStatusToProgressVariant = {
  [UPLOAD_STATUS.CANCELED]: ProgressVariant.warning,
  [UPLOAD_STATUS.ERROR]: ProgressVariant.danger,
  [UPLOAD_STATUS.SUCCESS]: ProgressVariant.success,
};

const WAIT_FOR_UPLOAD_READY = {
  COUNT: 150,
  INTERVAL_MS: 2 * 1000,
};

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

export const killUploadPVC = async (name: string, namespace: string, cluster?: string) => {
  return kubevirtK8sDelete({
    cluster,
    model: DataVolumeModel,
    resource: { metadata: { name, namespace } },
  });
};

const waitForUploadReady = async (dataVolume: V1beta1DataVolume) => {
  let dv = dataVolume;
  for (let i = 0; i < WAIT_FOR_UPLOAD_READY.COUNT; i++) {
    if (dv?.status?.phase === DV_UPLOAD_STATES.READY) {
      return true;
    }
    await delay(WAIT_FOR_UPLOAD_READY.INTERVAL_MS);
    dv = await getDataVolume(getName(dataVolume), getNamespace(dataVolume), getCluster(dataVolume));
  }

  throw new PVCInitError();
};

const createUploadToken = async (
  pvcName: string,
  namespace: string,
  cluster?: string,
): Promise<string> => {
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
    const resource = await kubevirtK8sCreate<UploadToken>({
      cluster,
      data: tokenRequest,
      model: UploadTokenRequestModel,
    });
    return resource?.status?.token;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const createUploadPVC = async (dataVolume: V1beta1DataVolume) => {
  const dvName = getName(dataVolume);
  const namespace = getNamespace(dataVolume);
  const cluster = getCluster(dataVolume);

  const updatedDataVolume = produce(dataVolume, (dvDraft) => {
    dvDraft.metadata.annotations = {
      ...(dvDraft.metadata.annotations || {}),
      [CDI_BIND_REQUESTED_ANNOTATION]: 'true',
    };
  });

  try {
    const dv = await kubevirtK8sCreate({
      cluster,
      data: updatedDataVolume,
      model: DataVolumeModel,
    });
    await waitForUploadReady(dv);
    const token = await createUploadToken(dvName, namespace, cluster);

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
  const cluster = getCluster(dataVolume);
  // Since DV is GC we want underlying PVC to get ownerReference and to be associated with VM parent
  return getPVC(getName(dataVolume), getNamespace(dataVolume), cluster)
    .then((pvc) =>
      kubevirtK8sPatch({
        cluster,
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
