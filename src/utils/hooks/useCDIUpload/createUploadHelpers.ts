import produce from 'immer';

import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { UploadTokenRequestModel } from '@kubevirt-utils/models';
import { getAPIVersionForModel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getDataVolume } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { CDI_BIND_REQUESTED_ANNOTATION } from './consts';

type UploadToken = K8sResourceCommon & {
  status: {
    token?: string;
  };
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
    // t('DataVolume failed to initiate upload.')
    super('DataVolume failed to initiate upload.');
  }
}

export const delay = (delayMs: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, delayMs));

const waitForUploadReady = async (dataVolume: V1beta1DataVolume): Promise<boolean> => {
  let currentDataVolume = dataVolume;
  const dvName = getName(dataVolume);
  const dvNamespace = getNamespace(dataVolume);
  const dvCluster = getCluster(dataVolume);

  for (let i = 0; i < WAIT_FOR_UPLOAD_READY.COUNT; i++) {
    if (currentDataVolume?.status?.phase === DV_UPLOAD_STATES.READY) {
      return true;
    }
    await delay(WAIT_FOR_UPLOAD_READY.INTERVAL_MS);
    currentDataVolume = await getDataVolume(dvName, dvNamespace, dvCluster);
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

export const createUploadPVC = async (
  dataVolume: V1beta1DataVolume,
): Promise<{ token: string }> => {
  const dvName = getName(dataVolume);
  const namespace = getNamespace(dataVolume);
  const cluster = getCluster(dataVolume);

  const updatedDataVolume = produce(dataVolume, (dvDraft) => {
    dvDraft.metadata.annotations = {
      ...(dvDraft.metadata.annotations ?? {}),
      [CDI_BIND_REQUESTED_ANNOTATION]: 'true',
    };
  });

  try {
    const createdDataVolume = await kubevirtK8sCreate({
      cluster,
      data: updatedDataVolume,
      model: DataVolumeModel,
    });
    await waitForUploadReady(createdDataVolume);
    const token = await createUploadToken(dvName, namespace, cluster);
    return { token };
  } catch (error) {
    if (error instanceof PVCInitError) {
      throw new PVCInitError();
    }
    throw new Error(error.message);
  }
};
