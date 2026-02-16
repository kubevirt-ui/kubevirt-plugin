import { CAPACITY_UNITS } from '@kubevirt-utils/components/CapacityInput/utils';
import { ApplicationAwareResourceQuotaModel } from '@kubevirt-utils/models';
import { ApplicationAwareResourceQuota } from '@kubevirt-utils/resources/quotas/types';

export const initialQuotaYaml: ApplicationAwareResourceQuota = {
  apiVersion: `${ApplicationAwareResourceQuotaModel.apiGroup}/${ApplicationAwareResourceQuotaModel.apiVersion}`,
  kind: ApplicationAwareResourceQuotaModel.kind,
  metadata: {
    name: '',
  },
  spec: {
    hard: {},
  },
};

export const QUOTA_UNITS = {
  cpu: 'vCPU',
  memory: CAPACITY_UNITS.GiB,
  vmCount: 'VMs',
} as const;

export const RESOURCE_KEYS = {
  configmaps: 'configmaps',
  cpuLimits: 'limits.cpu',
  cpuLimitsVMI: 'limits.cpu/vmi',
  cpuRequests: 'requests.cpu',
  cpuRequestsVMI: 'requests.cpu/vmi',
  datavolumes: 'count/datavolumes.cdi.kubevirt.io',
  ephemeralStorageLimits: 'limits.ephemeral-storage',
  ephemeralStorageRequests: 'requests.ephemeral-storage',
  gpuLimitsNvidia: 'limits.nvidia.com/gpu',
  gpuRequestsNvidia: 'requests.nvidia.com/gpu',
  memoryLimits: 'limits.memory',
  memoryLimitsVMI: 'limits.memory/vmi',
  memoryRequests: 'requests.memory',
  memoryRequestsVMI: 'requests.memory/vmi',
  persistentvolumeclaims: 'persistentvolumeclaims',
  pods: 'pods',
  replicationcontrollers: 'replicationcontrollers',
  resourcequotas: 'resourcequotas',
  secrets: 'secrets',
  services: 'services',
  servicesLoadbalancers: 'services.loadbalancers',
  servicesNodeports: 'services.nodeports',
  storageRequests: 'requests.storage',
  storageRequestsFastSsd: 'requests.storage/fast-ssd',
  storageRequestsStandard: 'requests.storage/standard',
  vmCount: 'count/virtualmachines.kubevirt.io',
  vmiCount: 'count/virtualmachineinstances.kubevirt.io',
  vmiInstances: 'instances/vmi',
  vmiMigrations: 'count/virtualmachineinstancemigrations.kubevirt.io',
} as const;

export const WARNING_THRESHOLD = 75;
export const DANGER_THRESHOLD = 100;

export const STATUS_CHART_THRESHOLDS = [
  { color: 'var(--pf-t--global--color--status--success--default)', value: 0 },
  {
    color: 'var(--pf-t--global--color--status--warning--default)',
    value: WARNING_THRESHOLD,
  },
  {
    color: 'var(--pf-t--global--color--status--danger--default)',
    value: DANGER_THRESHOLD,
  },
];
