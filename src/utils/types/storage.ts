import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type ClaimPropertySet = { accessModes: string[]; volumeMode?: string };
export type ClaimPropertySets = ClaimPropertySet[];

// type is not existing on kubevirt-api
export type StorageProfile = {
  spec: {
    claimPropertySets?: {
      accessModes: string[];
      volumeMode?: string;
    }[];
    cloneStrategy?: string;
  };
  status: {
    claimPropertySets?: {
      accessModes: string[];
      volumeMode?: string;
    }[];
    cloneStrategy?: string;
    provisioner: string;
    storageClass: string;
  };
} & K8sResourceCommon;
