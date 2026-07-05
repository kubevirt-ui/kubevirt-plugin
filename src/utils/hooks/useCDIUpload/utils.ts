import { type TFunction } from 'i18next';

import { DataVolumeModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { type V1beta1DataVolume } from '@kubevirt-ui-ext/kubevirt-api/containerized-data-importer';
import { type V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { PersistentVolumeClaimModel } from '@kubevirt-utils/models';
import { buildOwnerReference, getName, getNamespace } from '@kubevirt-utils/resources/shared';
import { getPVC } from '@kubevirt-utils/resources/template/hooks/useVmTemplateSource/utils';
import { getCluster } from '@multicluster/helpers/selectors';
import { kubevirtK8sDelete, kubevirtK8sPatch } from '@multicluster/k8sRequests';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { ProgressVariant } from '@patternfly/react-core';

import { t } from '../useKubevirtTranslation';

import { type CDIConfig, UPLOAD_STATUS } from './types';

export { createUploadPVC, delay, PVCInitError } from './createUploadHelpers';
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

export const getUploadProxyURL = (config: CDIConfig): string => config?.status?.uploadProxyURL;

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

/**
 * while in wizard, the vm is not yet created so we wait for it to be created before adding ownerReference
 * @param vm - VirtualMachine
 * @param dataVolume - DataVolume
 * @returns - Promise
 */
export const addUploadDataVolumeOwnerReference = (
  vm: V1VirtualMachine,
  dataVolume: V1beta1DataVolume,
): Promise<K8sResourceCommon | undefined> => {
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
    .catch(() => undefined);
};

export const isUploadingDisk = (uploadStatus?: UPLOAD_STATUS): boolean => {
  return (
    uploadStatus !== undefined &&
    [UPLOAD_STATUS.ALLOCATING, UPLOAD_STATUS.UPLOADING].includes(uploadStatus)
  );
};
