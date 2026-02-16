import { K8sResourceKind, Selector } from '@openshift-console/dynamic-plugin-sdk';

export enum CalculationMethod {
  DedicatedVirtualResources = 'DedicatedVirtualResources',
  VirtualResources = 'VirtualResources',
  VmiPodUsage = 'VmiPodUsage',
}

export type ResourceInfo = {
  [key: string]: string | undefined;
  configmaps?: string;
  'count/datavolumes.cdi.kubevirt.io'?: string;
  'count/virtualmachineinstancemigrations.kubevirt.io'?: string;
  'count/virtualmachineinstances.kubevirt.io'?: string;
  'count/virtualmachines.kubevirt.io'?: string;
  'limits.cpu'?: string;
  'limits.cpu/vmi'?: string;
  'limits.ephemeral-storage'?: string;
  'limits.memory'?: string;
  'limits.memory/vmi'?: string;
  'limits.nvidia.com/gpu'?: string;
  persistentvolumeclaims?: string;
  pods?: string;
  replicationcontrollers?: string;
  'requests.cpu'?: string;
  'requests.cpu/vmi'?: string;
  'requests.ephemeral-storage'?: string;
  'requests.memory'?: string;
  'requests.memory/vmi'?: string;
  'requests.nvidia.com/gpu'?: string;
  'requests.storage'?: string;
  'requests.storage/fast-ssd'?: string;
  'requests.storage/standard'?: string;
  resourcequotas?: string;
  secrets?: string;
  services?: string;
  'services.loadbalancers'?: string;
  'services.nodeports'?: string;
};

type ApplicationAwareResourceQuotaSpec = {
  hard: ResourceInfo;
};

type ApplicationAwareClusterResourceQuotaSpec = {
  quota: {
    hard: ResourceInfo;
  };
  selector?: {
    labels?: Selector;
  };
};

export type QuotaStatus = {
  hard: ResourceInfo;
  used: ResourceInfo;
};

export type ApplicationAwareResourceQuota = K8sResourceKind & {
  spec: ApplicationAwareResourceQuotaSpec;
  status?: QuotaStatus;
};

export type ApplicationAwareClusterResourceQuota = K8sResourceKind & {
  spec: ApplicationAwareClusterResourceQuotaSpec;
  status?: {
    namespaces?: {
      namespace: string;
      status: QuotaStatus;
    }[];
    total: QuotaStatus;
  };
};

export type ApplicationAwareQuota =
  | ApplicationAwareClusterResourceQuota
  | ApplicationAwareResourceQuota;
