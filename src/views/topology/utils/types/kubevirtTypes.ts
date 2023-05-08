import { V1DataVolumeTemplateSpec, V1VolumeStatus } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { K8sResourceCondition } from '@kubevirt-utils/types/k8sTypes';
import { ObjectMetadata } from '@openshift-console/dynamic-plugin-sdk';

import { K8sResourceKind } from '../../../clusteroverview/utils/types';

export type NodeSelector = {
  [key: string]: string;
};

// https://kubevirt.io/api-reference/v0.38.1/definitions.html#_v1_virtualmachineinstancespec
export type VMISpec = {
  affinity: any;
  dnsConfig: any;
  dnsPolicy: string;
  domain?: any;
  evictionStrategy?: string;
  hostname: string;
  livenessProbe: any;
  networks?: any[];
  nodeSelector: NodeSelector;
  readinessProbe: any;
  subdomain: string;
  terminationGracePeriodSeconds: number;
  tolerations: any[];
  volumes?: any[];
  accessCredentials?: any;
};

// https://kubevirt.io/api-reference/v0.38.1/definitions.html#_v1_virtualmachineinstancestatus
export type VMIStatus = {
  conditions: any[];
  interfaces: any[];
  migrationMethod: string;
  migrationState: any;
  nodeName: string;
  phase: string;
  reason: string;
  volumeStatus?: V1VolumeStatus[];
};

export type VMIKind = {
  spec: VMISpec;
  status: VMIStatus;
} & K8sResourceKind;

export type VMITemplate = {
  metadata?: ObjectMetadata;
  spec?: VMISpec;
};

export type VMSpec = {
  template: VMITemplate;
  running?: boolean;
  runStrategy?: string;
  dataVolumeTemplates?: V1DataVolumeTemplateSpec[];
};

export type VMStatusStateChangeRequest = {
  action: string;
  uid: string;
  data: { [key: string]: string };
};

export type VMStatus = {
  conditions?: any[];
  created?: boolean;
  ready?: boolean;
  printableStatus?: string;
  stateChangeRequests?: VMStatusStateChangeRequest[];
};

// https://kubevirt.io/api-reference/v0.38.1/definitions.html#_v1_virtualmachine
export type VMKind = {
  spec: VMSpec;
  status: VMStatus;
} & K8sResourceKind;

type Source = {
  id: string;
};

type Target = {
  name?: string;
};

export type NetworkMapping = {
  source: Source; // NIC ID
  target?: Target;
  type: string;
};

export type StorageMapping = {
  source: Source; // Storage Domain ID
  target: Target;
  volumeMode?: string;
};

export type DiskMapping = {
  source: Source; // Disk ID
  target: Target;
  volumeMode?: string;
};

export type VMImportOvirtSource = {
  vm: {
    id?: string;
    name?: string;
    cluster?: {
      name?: string;
      id?: string;
    };
  };
  mappings: {
    networkMappings?: NetworkMapping[];
    storageMappings?: StorageMapping[];
    diskMappings?: DiskMapping[];
  };
};

export type VMImportVMwareSource = {
  vm: {
    id?: string;
    name?: string;
  };
  mappings: {
    networkMappings?: NetworkMapping[];
    storageMappings?: StorageMapping[];
    diskMappings?: DiskMapping[];
  };
};

export type VMImportKind = {
  spec: {
    targetVmName?: string;
    startVm?: boolean;
    providerCredentialsSecret: {
      name: string;
      namespace?: string;
    };
    resourceMapping: {
      name: string;
      namespace?: string;
    };
    source: {
      ovirt: VMImportOvirtSource;
      vmware: VMImportVMwareSource;
    };
  };
  status?: {
    targetVmName: string;
    dataVolumes: string[];
    conditions: K8sResourceCondition[];
  };
} & K8sResourceKind;
