import { V1DataVolumeTemplateSpec, V1VolumeStatus } from '@kubevirt-types';
import { K8sResourceCondition, K8sResourceKind } from '@kubevirt-types/internal';
import { ObjectMetadata } from '@openshift-console/dynamic-plugin-sdk';

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

export type VMStatusCondition = {
  lastProbeTime?: string;
  lastTransitionTime: string;
  message: string;
  reason: string;
  status: string;
  type: string;
};

export type VMStatus = {
  conditions?: VMStatusCondition[];
  created?: boolean;
  ready?: boolean;
  printableStatus?: string;
  stateChangeRequests?: VMStatusStateChangeRequest[];
};

export type VMStatusStateChangeRequest = {
  action: string;
  uid: string;
  data: { [key: string]: string };
};

export type VMKind = {
  spec: VMSpec;
  status: VMStatus;
} & K8sResourceKind;

export type CPU = {
  sockets: number;
  cores: number;
  threads: number;
  dedicatedCpuPlacement?: boolean;
};

export type CPURaw = {
  sockets: string;
  cores: string;
  threads: string;
};

export type V1NetworkInterface = {
  name?: string;
  model?: string;
  macAddress?: string;
  bootOrder?: number;
  bridge?: any;
  masquerade?: any;
  sriov?: any;
  slirp?: any;
};

export type NodeSelector = {
  [key: string]: string;
};

export type VMSnapshot = {
  spec: {
    source: {
      apiGroup: string;
      kind: string;
      name: string;
    };
  };
} & K8sResourceKind;

export type VMRestore = {
  spec: {
    target: {
      apiGroup: string;
      kind: string;
      name: string;
    };
    virtualMachineSnapshotName: string;
    includeVolumes: string[];
    excludeVolumes: string[];
  };
  status: {
    complete: boolean;
    conditions: K8sResourceCondition[];
    restoreTime: string;
  };
} & K8sResourceKind;

export type StorageProfile = {
  spec: any;
  status: {
    claimPropertySets?: [
      {
        accessModes?: string[];
        volumeMode?: string;
      },
    ];
    provisioner: string;
    storageClass: string;
  };
} & K8sResourceKind;
