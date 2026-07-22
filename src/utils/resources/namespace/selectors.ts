import { getAnnotation } from '@kubevirt-utils/resources/shared';
import { type K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import {
  PROJECT_ALLOW_POD_NETWORK_ANNOTATION,
  PROJECT_ALLOW_POD_NETWORK_FALSE_VALUE,
  PROJECT_DEFAULT_NETWORK_ANNOTATION,
} from './constants';

export type ProjectNetworkSettings = {
  defaultNadName?: string;
  isPodNetworkAllowed: boolean;
};

const getProjectDefaultNadName = (namespace?: K8sResourceCommon): string | undefined => {
  const value = getAnnotation(namespace, PROJECT_DEFAULT_NETWORK_ANNOTATION);
  return value || undefined;
};

const isPodNetworkAllowed = (namespace?: K8sResourceCommon): boolean => {
  const value = getAnnotation(namespace, PROJECT_ALLOW_POD_NETWORK_ANNOTATION);
  return value !== PROJECT_ALLOW_POD_NETWORK_FALSE_VALUE;
};

export const getProjectNetworkSettings = (
  namespace?: K8sResourceCommon,
): ProjectNetworkSettings => ({
  defaultNadName: getProjectDefaultNadName(namespace),
  isPodNetworkAllowed: isPodNetworkAllowed(namespace),
});
