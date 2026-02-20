import { TFunction } from 'react-i18next';

import {
  ApplicationAwareClusterResourceQuotaModel,
  ApplicationAwareResourceQuotaModel,
} from '@kubevirt-utils/models';
import {
  ApplicationAwareResourceQuota,
  QuotaStatus,
  ResourceInfo,
} from '@kubevirt-utils/resources/quotas/types';
import { ApplicationAwareQuota } from '@kubevirt-utils/resources/quotas/types';
import { convertToBaseValue } from '@kubevirt-utils/utils/humanize.js';

import { ResourceKeyKind } from '../details/types';

import { RESOURCE_KEYS } from './constants';

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

export const getStatus = (quota: ApplicationAwareQuota): QuotaStatus =>
  isNamespacedQuota(quota) ? quota?.status : quota?.status?.total;

export const getSpecLimits = (quota: ApplicationAwareQuota): ResourceInfo =>
  isNamespacedQuota(quota) ? quota?.spec?.hard : quota?.spec?.quota?.hard;

export const getMainResourceKeys = (isDedicatedVirtualResources: boolean) => {
  return {
    cpu: isDedicatedVirtualResources ? RESOURCE_KEYS.cpuRequestsVMI : RESOURCE_KEYS.cpuRequests,
    memory: isDedicatedVirtualResources
      ? RESOURCE_KEYS.memoryRequestsVMI
      : RESOURCE_KEYS.memoryRequests,
    vmCount: RESOURCE_KEYS.vmCount,
  };
};

const getResourceKeyPriority = (key: string): number => {
  if (key.startsWith(RESOURCE_KEYS.cpuRequests)) return 0;
  if (key.startsWith(RESOURCE_KEYS.memoryRequests)) return 1;
  if (key === RESOURCE_KEYS.vmCount) return 2;
  return 3;
};

const getResourceKeys = (quota: ApplicationAwareQuota): string[] => {
  return Object.keys(getStatus(quota)?.hard ?? {});
};

export const getSortedResourceKeys = (quota: ApplicationAwareQuota): string[] => {
  const keys = getResourceKeys(quota);

  return keys.sort((a, b) => {
    const priorityA = getResourceKeyPriority(a);
    const priorityB = getResourceKeyPriority(b);
    if (priorityA !== priorityB) return priorityA - priorityB;
    return a.localeCompare(b);
  });
};

export const getAdditionalResourceKeys = (quota: ApplicationAwareQuota): string[] => {
  return getResourceKeys(quota).filter((key) => getResourceKeyPriority(key) > 2);
};

export const getResourceKeyKind = (key: string): ResourceKeyKind => {
  if (key.startsWith(RESOURCE_KEYS.cpuRequests) || key.startsWith(RESOURCE_KEYS.cpuLimits)) {
    return ResourceKeyKind.CPU;
  }
  if (
    key.startsWith(RESOURCE_KEYS.memoryRequests) ||
    key.startsWith(RESOURCE_KEYS.memoryLimits) ||
    key.startsWith(RESOURCE_KEYS.ephemeralStorageRequests) ||
    key.startsWith(RESOURCE_KEYS.ephemeralStorageLimits) ||
    key.startsWith(RESOURCE_KEYS.storageRequests)
  ) {
    return ResourceKeyKind.MEMORY;
  }
  return ResourceKeyKind.COUNT;
};

export const getResourceLabel = (key: string, t: TFunction): string => {
  const labels: Record<string, string> = {
    [RESOURCE_KEYS.configmaps]: t('ConfigMaps'),
    [RESOURCE_KEYS.cpuLimits]: t('vCPU limits'),
    [RESOURCE_KEYS.cpuLimitsVMI]: t('vCPU limits (VMs)'),
    [RESOURCE_KEYS.cpuRequests]: t('vCPU requests'),
    [RESOURCE_KEYS.cpuRequestsVMI]: t('vCPU requests (VMs)'),
    [RESOURCE_KEYS.datavolumes]: t('DataVolumes'),
    [RESOURCE_KEYS.ephemeralStorageLimits]: t('Ephemeral storage limits'),
    [RESOURCE_KEYS.ephemeralStorageRequests]: t('Ephemeral storage requests'),
    [RESOURCE_KEYS.gpuLimitsNvidia]: t('GPU limits (NVIDIA)'),
    [RESOURCE_KEYS.gpuRequestsNvidia]: t('GPU requests (NVIDIA)'),
    [RESOURCE_KEYS.memoryLimits]: t('Memory limits'),
    [RESOURCE_KEYS.memoryLimitsVMI]: t('Memory limits (VMs)'),
    [RESOURCE_KEYS.memoryRequests]: t('Memory requests'),
    [RESOURCE_KEYS.memoryRequestsVMI]: t('Memory requests (VMs)'),
    [RESOURCE_KEYS.persistentvolumeclaims]: t('PVCs'),
    [RESOURCE_KEYS.pods]: t('Pods'),
    [RESOURCE_KEYS.replicationcontrollers]: t('Replication controllers'),
    [RESOURCE_KEYS.resourcequotas]: t('Resource quotas'),
    [RESOURCE_KEYS.secrets]: t('Secrets'),
    [RESOURCE_KEYS.services]: t('Services'),
    [RESOURCE_KEYS.servicesLoadbalancers]: t('Load balancers'),
    [RESOURCE_KEYS.servicesNodeports]: t('Node ports'),
    [RESOURCE_KEYS.storageRequests]: t('Storage requests'),
    [RESOURCE_KEYS.storageRequestsFastSsd]: t('Storage requests (fast-ssd)'),
    [RESOURCE_KEYS.storageRequestsStandard]: t('Storage requests (standard)'),
    [RESOURCE_KEYS.vmCount]: t('VMs'),
    [RESOURCE_KEYS.vmiCount]: t('VMIs'),
    [RESOURCE_KEYS.vmiInstances]: t('VMI instances'),
    [RESOURCE_KEYS.vmiMigrations]: t('VMI migrations'),
  };

  return labels[key] ?? key;
};

export const getQuotaNumbers = (
  usedValue: string,
  maxValue: string,
): { available: number; max: number; percentage: number; used: number } => {
  const max = (convertToBaseValue(maxValue) as number) ?? 0;
  const used = (convertToBaseValue(usedValue) as number) ?? 0;
  const available = used > max ? 0 : max - used;
  const percentage = max === 0 ? 100 : (used / max) * 100;

  return { available, max, percentage, used };
};
