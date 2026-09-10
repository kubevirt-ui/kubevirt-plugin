import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export type RouteResource = K8sResourceCommon & {
  spec?: {
    host?: string;
  };
};
