import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type ClusterVersion = K8sResourceCommon & {
  status: {
    desired: {
      version: string;
    };
  };
};
