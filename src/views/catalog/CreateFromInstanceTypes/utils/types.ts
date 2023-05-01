import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';

import {
  InstanceTypeCategory,
  InstanceTypeSize,
} from '../components/SelectInstanceTypeSection/utils/types';

export type InstanceTypeState = {
  category: InstanceTypeCategory;
  size: InstanceTypeSize;
  name: string;
};
export type BootableVolume = V1beta1DataSource | IoK8sApiCoreV1PersistentVolumeClaim;
