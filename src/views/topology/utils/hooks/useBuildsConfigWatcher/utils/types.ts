import { ObjectMetadata, Selector } from '@openshift-console/dynamic-plugin-sdk';

import { K8sResourceCondition } from '../../../../../clusteroverview/utils/types';

type ProbePort = string | number;

export type ExecProbe = {
  command: string[];
};

export type HTTPGetProbe = {
  path?: string;
  port: ProbePort;
  host?: string;
  scheme: 'HTTP' | 'HTTPS';
  httpHeaders?: any[];
};

export type TCPSocketProbe = {
  port: ProbePort;
  host?: string;
};

export type Handler = {
  exec?: ExecProbe;
  httpGet?: HTTPGetProbe;
  tcpSocket?: TCPSocketProbe;
};

export type ContainerProbe = {
  initialDelaySeconds?: number;
  timeoutSeconds?: number;
  periodSeconds?: number;
  successThreshold?: number;
  failureThreshold?: number;
} & Handler;

export type EnvVarSource = {
  fieldRef?: {
    apiVersion?: string;
    fieldPath: string;
  };
  resourceFieldRef?: {
    resource: string;
    containerName?: string;
    divisor?: string;
  };
  configMapKeyRef?: {
    key: string;
    name: string;
  };
  secretKeyRef?: {
    key: string;
    name: string;
  };
  configMapRef?: {
    key?: string;
    name: string;
  };
  secretRef?: {
    key?: string;
    name: string;
  };
  configMapSecretRef?: {
    key?: string;
    name: string;
  };
  serviceAccountRef?: {
    key?: string;
    name: string;
  };
};

export type EnvVar = {
  name: string;
  value?: string;
  valueFrom?: EnvVarSource;
};

export type ContainerPort = {
  name?: string;
  containerPort: number;
  protocol: string;
};

export type VolumeMount = {
  mountPath: string;
  mountPropagation?: 'None' | 'HostToContainer' | 'Bidirectional';
  name: string;
  readOnly?: boolean;
  subPath?: string;
  subPathExpr?: string;
};

export type VolumeDevice = {
  devicePath: string;
  name: string;
};

export type ContainerLifecycle = {
  postStart?: Handler;
  preStop?: Handler;
};

export type ResourceList = {
  [resourceName: string]: string;
};

export enum ImagePullPolicy {
  Always = 'Always',
  Never = 'Never',
  IfNotPresent = 'IfNotPresent',
}

export type ContainerSpec = {
  name: string;
  volumeMounts?: VolumeMount[];
  volumeDevices?: VolumeDevice[];
  env?: EnvVar[];
  livenessProbe?: ContainerProbe;
  readinessProbe?: ContainerProbe;
  lifecycle?: ContainerLifecycle;
  resources?: {
    limits?: ResourceList;
    requested?: ResourceList;
  };
  ports?: ContainerPort[];
  imagePullPolicy?: ImagePullPolicy;
  [key: string]: any;
};

export type Volume = {
  name: string;
  [key: string]: any;
};

export type TolerationOperator = 'Exists' | 'Equal';

export type TaintEffect = '' | 'NoSchedule' | 'PreferNoSchedule' | 'NoExecute';

export type Toleration = {
  effect: TaintEffect;
  key?: string;
  operator: TolerationOperator;
  tolerationSeconds?: number;
  value?: string;
};

export type PodSpec = {
  volumes?: Volume[];
  initContainers?: ContainerSpec[];
  containers: ContainerSpec[];
  restartPolicy?: 'Always' | 'OnFailure' | 'Never';
  terminationGracePeriodSeconds?: number;
  activeDeadlineSeconds?: number;
  nodeSelector?: any;
  serviceAccountName?: string;
  priorityClassName?: string;
  tolerations?: Toleration[];
  nodeName?: string;
  hostname?: string;
  [key: string]: any;
};

export type PodTemplate = {
  metadata: ObjectMetadata;
  spec: PodSpec;
};

export type JobTemplate = {
  metadata: ObjectMetadata;
  spec: {
    activeDeadlineSeconds?: number;
    backoffLimit?: number;
    completions?: number;
    manualSelector?: boolean;
    parallelism?: boolean;
    selector?: Selector;
    template: PodTemplate;
    ttlSecondsAfterFinished?: number;
  };
};

export type JobKind = {
  apiVersion: string;
  kind: string;
  status: {
    active?: number;
    completionTime?: string;
    conditions?: K8sResourceCondition[];
    failed?: number;
    startTime?: string;
    succeeded?: number;
  };
} & JobTemplate;

export type CronJobKind = {
  apiVersion: string;
  kind: string;
  metadata: ObjectMetadata;
  spec: {
    concurrencyPolicy?: string;
    failedJobsHistoryLimit?: number;
    jobTemplate: JobTemplate;
    schedule: string;
    startingDeadlineSeconds?: number;
    successfulJobsHistoryLimit?: number;
    suspend?: boolean;
  };
  status: {
    active?: {
      apiVersion?: string;
      fieldPath?: string;
      kind?: string;
      name?: string;
      namespace?: string;
      resourceVersion?: string;
      uid?: string;
    }[];
    lastScheduleTime?: string;
  };
};
