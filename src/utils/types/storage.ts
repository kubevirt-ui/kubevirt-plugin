import { V1beta1StorageSpecAccessModesEnum } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type ClaimPropertySet = {
  accessModes: V1beta1StorageSpecAccessModesEnum[];
  volumeMode?: string;
};
export type ClaimPropertySets = ClaimPropertySet[];

// type is not existing on kubevirt-api
export type StorageProfile = {
  spec: {
    claimPropertySets?: {
      accessModes: V1beta1StorageSpecAccessModesEnum[];
      volumeMode?: string;
    }[];
    cloneStrategy?: string;
  };
  status: {
    claimPropertySets?: {
      accessModes: V1beta1StorageSpecAccessModesEnum[];
      volumeMode?: string;
    }[];
    cloneStrategy?: string;
    provisioner: string;
    storageClass: string;
  };
} & K8sResourceCommon;
