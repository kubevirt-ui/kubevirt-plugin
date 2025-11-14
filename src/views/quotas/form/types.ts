import { IDLabel } from '@kubevirt-utils/components/NodeSelectorModal/utils/types';
import { K8sResourceKind, Selector } from '@openshift-console/dynamic-plugin-sdk';

import { SCOPE } from './constants';

export type ScopeType = typeof SCOPE[keyof typeof SCOPE];

export type VirtualizationQuota = {
  cpuLimit?: number;
  labelSelectors?: IDLabel[];
  memoryLimit?: number;
  name: string;
  namespace?: string;
  projects?: string[];
  scope: ScopeType;
  useLabelSelectors?: boolean;
  vmCountLimit?: number;
};

export type ResourceInfo = {
  // Allow any resource type
  [key: string]: string | undefined;
  // Object counts
  configmaps?: string;
  // Custom resource counts
  'count/datavolumes.cdi.kubevirt.io'?: string;
  'count/virtualmachineinstancemigrations.kubevirt.io'?: string;
  'count/virtualmachineinstances.kubevirt.io'?: string;
  'count/virtualmachines.kubevirt.io'?: string;
  // Standard Kubernetes resources
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
  // Network resources
  'services.loadbalancers'?: string;
  'services.nodeports'?: string;
};

export type ApplicationAwareResourceQuotaSpec = {
  hard: ResourceInfo;
};

export type ApplicationAwareClusterResourceQuotaSpec = {
  quota: {
    hard: ResourceInfo;
  };
  selector?: {
    labels?: Selector;
  };
};

type Status = {
  hard: ResourceInfo;
  used: ResourceInfo;
};

export type ApplicationAwareResourceQuota = K8sResourceKind & {
  spec: ApplicationAwareResourceQuotaSpec;
  status?: Status;
};

export type ApplicationAwareClusterResourceQuota = K8sResourceKind & {
  spec: ApplicationAwareClusterResourceQuotaSpec;
  status?: {
    namespaces?: {
      namespace: string;
      status: Status;
    }[];
    total: Status;
  };
};

export type ApplicationAwareQuota =
  | ApplicationAwareClusterResourceQuota
  | ApplicationAwareResourceQuota;
