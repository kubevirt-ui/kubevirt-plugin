import {
  ConfigMapModel,
  DataVolumeModel,
  PersistentVolumeClaimModel,
  SecretModel,
  ServiceAccountModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { VolumeTypes } from '@kubevirt-utils/components/DiskModal/utils/types';
import { type K8sModel } from '@openshift-console/dynamic-plugin-sdk';

export const mapVolumeTypeToK8sModel: Partial<Record<VolumeTypes, K8sModel>> = {
  [VolumeTypes.CONFIG_MAP]: ConfigMapModel,
  [VolumeTypes.DATA_VOLUME]: DataVolumeModel,
  [VolumeTypes.PERSISTENT_VOLUME_CLAIM]: PersistentVolumeClaimModel,
  [VolumeTypes.SECRET]: SecretModel,
  [VolumeTypes.SERVICE_ACCOUNT]: ServiceAccountModel,
};
