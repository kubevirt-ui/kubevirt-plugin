import {
  ConfigMapModel,
  PersistentVolumeClaimModel,
  SecretModel,
  ServiceAccountModel,
} from '@kubevirt-ui/kubevirt-api/console';
import DataVolumeModel from '@kubevirt-ui/kubevirt-api/console/models/DataVolumeModel';
import { VolumeTypes } from '@kubevirt-utils/components/DiskModal/utils/types';

export const mapVolumeTypeToK8sModel = {
  [VolumeTypes.CONFIG_MAP]: ConfigMapModel,
  [VolumeTypes.DATA_VOLUME]: DataVolumeModel,
  [VolumeTypes.PERSISTENT_VOLUME_CLAIM]: PersistentVolumeClaimModel,
  [VolumeTypes.SECRET]: SecretModel,
  [VolumeTypes.SERVICE_ACCOUNT]: ServiceAccountModel,
};
