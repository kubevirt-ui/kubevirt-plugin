import { type TFunction } from 'i18next';
import produce from 'immer';

import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { buildOwnerReference, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getPVC } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sCreate, kubevirtK8sDelete, kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { ProgressVariant } from '@patternfly/react-core';

import { t } from '../useKubevirtTranslation';

import { CDI_BIND_REQUESTED_ANNOTATION } from './consts';
import { type CDIConfig, UPLOAD_STATUS } from './types';
import { PVCInitError } from './uploadConstants';
import { createUploadToken, waitForUploadReady } from './uploadHelpers';

export type { CDIConfig } from './types';
export { UPLOAD_STATUS } from './types';

export const UPLOAD_STATUS_LABELS = {
  [UPLOAD_STATUS.ALLOCATING]: t('Allocating resources, please wait for upload to start.'),
  [UPLOAD_STATUS.CANCELED]: t('Canceled'),
  [UPLOAD_STATUS.ERROR]: t('Error'),
  [UPLOAD_STATUS.SUCCESS]: t('Success'),
  [UPLOAD_STATUS.UPLOADING]: t('Uploading'),
};

export const getCancelUploadLabel = (tFunc: TFunction): string => tFunc('Cancel upload');

export const uploadStatusToProgressVariant = {
  [UPLOAD_STATUS.CANCELED]: ProgressVariant.warning,
  [UPLOAD_STATUS.ERROR]: ProgressVariant.danger,
  [UPLOAD_STATUS.SUCCESS]: ProgressVariant.success,
};

export { delay, PVCInitError } from './uploadConstants';

export const getUploadProxyURL = (config: CDIConfig): string | undefined =>
  config?.status?.uploadProxyURL;

export const getUploadURL = (uploadProxyURL: string): string =>
  `https://${uploadProxyURL}/v1beta1/upload-form-async`;

export const cancelUploadPVC = async (
  name: string,
  namespace: string,
  cluster?: string,
): Promise<K8sResourceCommon> => {
  return kubevirtK8sDelete({
    cluster,
    model: DataVolumeModel,
    resource: { metadata: { name, namespace } },
  });
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
    const token = await createUploadToken({ cluster, namespace, pvcName: dvName });
    return { token };
  } catch (error) {
    if (error instanceof PVCInitError) {
      throw error;
    }
    throw new Error(error instanceof Error ? error.message : String(error));
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
): Promise<K8sResourceCommon | void> => {
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
              ...(pvc?.metadata?.ownerReferences ?? []),
              buildOwnerReference(vm, { blockOwnerDeletion: false }),
            ],
          },
        ],
        model: PersistentVolumeClaimModel,
        resource: pvc,
      }),
    )
    .catch((error: unknown) => {
      // PVC ownerReference update is best-effort — the VM will still function correctly
      kubevirtConsole.warn('Failed to add ownerReference to PVC for DataVolume', error);
    });
};

export const isUploadingDisk = (uploadStatus?: UPLOAD_STATUS): boolean => {
  return (
    uploadStatus !== undefined &&
    [UPLOAD_STATUS.ALLOCATING, UPLOAD_STATUS.UPLOADING].includes(uploadStatus)
  );
};
