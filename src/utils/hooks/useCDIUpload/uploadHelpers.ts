import { type V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { UploadTokenRequestModel } from '@kubevirt-utils/models';
import { getAPIVersionForModel, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getDataVolume } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate } from '@multicluster/k8sRequests';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { delay, PVCInitError } from './uploadConstants';

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

export const waitForUploadReady = async (dataVolume: V1beta1DataVolume): Promise<boolean> => {
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

export const createUploadToken = async ({
  cluster,
  namespace,
  pvcName,
}: {
  cluster?: string;
  namespace: string;
  pvcName: string;
}): Promise<string> => {
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
    const token = resource?.status?.token;
    if (!token) {
      throw new Error('Upload token was not returned by the server');
    }
    return token;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(String(error));
  }
};
