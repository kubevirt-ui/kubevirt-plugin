import { DEFAULT_NAMESPACE } from '@kubevirt-utils/constants/constants';
import { ALL_NAMESPACES } from '@kubevirt-utils/hooks/constants';
import { ResourceQuotaModel } from '@kubevirt-utils/models';
import { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';
import { getName, getNamespace, getResourceUrl } from '@kubevirt-utils/resources/shared';

import { isNamespacedQuota } from './utils';

export const CLUSTER_QUOTA_LIST_URL = '/k8s/cluster/quotas';

export const getQuotaListURL = (namespace?: string): string => {
  if (namespace) {
    return `/k8s/ns/${namespace}/quotas`;
  }
  return `/k8s/${ALL_NAMESPACES}/quotas`;
};

export const getQuotaCreateFormURL = (namespace?: string): string => {
  return `/k8s/ns/${namespace ?? DEFAULT_NAMESPACE}/quotas/~new`;
};

export const getQuotaCreateFormYAMLURL = (namespace?: string): string => {
  return `${getQuotaCreateFormURL(namespace)}/yaml`;
};

export const getQuotaEditFormURL = (name: string, namespace: string): string => {
  return `/k8s/ns/${namespace}/quotas/${name}/edit`;
};

export const getQuotaEditFormYAMLURL = (name: string, namespace: string): string => {
  return `${getQuotaEditFormURL(name, namespace)}/yaml`;
};

export const getStandardResourceQuotaListURL = (namespace?: string): string => {
  return getResourceUrl({
    activeNamespace: namespace,
    model: ResourceQuotaModel,
  });
};

export const getClusterQuotaYAMLEditorURL = (quota: ApplicationAwareQuota): string => {
  return `/k8s/cluster/quotas/${getName(quota)}`;
};

export const getQuotaDetailsURL = (quota: ApplicationAwareQuota): string => {
  return isNamespacedQuota(quota)
    ? `/k8s/ns/${getNamespace(quota)}/quotas/${getName(quota)}`
    : getClusterQuotaYAMLEditorURL(quota);
};

export const getQuotaEditPageURL = (
  quota: ApplicationAwareQuota,
  hasAdditionalResources: boolean,
): string => {
  if (!isNamespacedQuota(quota)) {
    return getClusterQuotaYAMLEditorURL(quota);
  }

  const name = getName(quota);
  const namespace = getNamespace(quota);

  if (hasAdditionalResources) {
    return getQuotaEditFormYAMLURL(name, namespace);
  }
  return getQuotaEditFormURL(name, namespace);
};
