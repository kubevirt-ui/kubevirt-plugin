import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const MTV_OPERATOR = 'mtv-operator';
export const MTV_ROUTE_NAME = 'virt';
export type PackageManifestKind = K8sResourceCommon & { status: any };

export const HTTP_REG_EXP = /^http(s)?:\/\//;
