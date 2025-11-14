import {
  ApplicationAwareClusterResourceQuotaModel,
  ApplicationAwareResourceQuotaModel,
} from '@kubevirt-utils/models';
import { getName, getNamespace } from '@kubevirt-utils/resources/shared';

import { ApplicationAwareQuota, ApplicationAwareResourceQuota } from '../form/types';

export const getQuotaModel = (quota: ApplicationAwareQuota) => {
  return isNamespacedQuota(quota)
    ? ApplicationAwareResourceQuotaModel
    : ApplicationAwareClusterResourceQuotaModel;
};

export const isNamespacedQuota = (
  yaml: ApplicationAwareQuota,
): yaml is ApplicationAwareResourceQuota => {
  return yaml?.kind === ApplicationAwareResourceQuotaModel.kind;
};

export const getHardFieldKeys = (isDedicatedVirtualResources: boolean) => {
  return {
    cpu: isDedicatedVirtualResources ? 'requests.cpu/vmi' : 'requests.cpu',
    memory: isDedicatedVirtualResources ? 'requests.memory/vmi' : 'requests.memory',
    vmCount: 'count/virtualmachines.kubevirt.io',
    vmiCount: 'instances/vmi',
  };
};

export const getStatus = (quota: ApplicationAwareQuota) =>
  isNamespacedQuota(quota) ? quota?.status : quota?.status?.total;

export const getQuotaDetailsPath = (quota: ApplicationAwareQuota) => {
  return isNamespacedQuota(quota)
    ? `/k8s/ns/${getNamespace(quota)}/quotas/${getName(quota)}`
    : `/k8s/cluster/quotas/${getName(quota)}`;
};
