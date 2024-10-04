import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';

import { getName } from '../shared';

import { SYSTEM_NAMESPACES, SYSTEM_NAMESPACES_PREFIX } from './constants';

export const isSystemNamespace = (namespace: string) => {
  const startsWithNamespace = SYSTEM_NAMESPACES_PREFIX.some((ns) => namespace?.startsWith(ns));
  const isNamespace = SYSTEM_NAMESPACES.includes(namespace);

  return startsWithNamespace || isNamespace;
};

export const getUserDefaultNamespaceName = (namespaces: K8sResourceCommon[]) => {
  const defaultNamespace =
    namespaces.find((project) => getName(project) === DEFAULT_NAMESPACE) ||
    namespaces.find((project) => !isSystemNamespace(getName(project))) ||
    namespaces?.[0];

  return getName(defaultNamespace);
};
