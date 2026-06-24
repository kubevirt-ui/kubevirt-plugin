import { getName } from '@kubevirt-utils/resources/shared';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

export const extractName = (resource: K8sResourceCommon): string => getName(resource);

export const identity = <T>(value: T): T => value;
