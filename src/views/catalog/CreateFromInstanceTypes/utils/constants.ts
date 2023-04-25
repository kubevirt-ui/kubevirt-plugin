import { V1beta1DataSource } from '@kubevirt-ui/kubevirt-api/containerized-data-importer/models';
import { IoK8sApiCoreV1PersistentVolumeClaim } from '@kubevirt-ui/kubevirt-api/kubernetes';

import {
  InstanceTypeCategory,
  InstanceTypeSize,
} from '../components/SelectInstanceTypeSection/utils/types';

export enum INSTANCE_TYPES_SECTIONS {
  SELECT_VOLUME = 1,
  SELECT_INSTANCE_TYPE = 2,
  VM_DETAILS = 3,
}

export const DEFAULT_PREFERENCE_LABEL = 'instancetype.kubevirt.io/default-preference';
export const DEFAULT_INSTANCETYPE_LABEL = 'instancetype.kubevirt.io/default-instancetype';
export const PREFERENCE_DISPLAY_NAME_KEY = 'openshift.io/display-name';

export type InstanceTypeState = {
  category: InstanceTypeCategory;
  size: InstanceTypeSize;
  name: string;
};

export const initialInstanceTypeState: InstanceTypeState = {
  category: null,
  size: null,
  name: null,
};

export type BootableVolume = V1beta1DataSource | IoK8sApiCoreV1PersistentVolumeClaim;
