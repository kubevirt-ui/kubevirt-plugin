import { K8sResourceCommon, ObjectMetadata } from '@openshift-console/dynamic-plugin-sdk';
import { global_palette_purple_300 as globalPurple300 } from '@patternfly/react-tokens/dist/js/global_palette_purple_300';
import { global_palette_white as globalWhite } from '@patternfly/react-tokens/dist/js/global_palette_white';
import { global_warning_color_100 as globalWarning100 } from '@patternfly/react-tokens/dist/js/global_warning_color_100';

import { K8sResourceCondition, K8sResourceKind } from '../../../clusteroverview/utils/types';
import { PodSpec } from '../hooks/useBuildsConfigWatcher/utils/types';

import { PodPhase } from './topology-types';

export enum AllPodStatus {
  Running = 'Running',
  NotReady = 'Not Ready',
  Warning = 'Warning',
  Empty = 'Empty',
  Failed = 'Failed',
  Pending = 'Pending',
  Succeeded = 'Succeeded',
  Terminating = 'Terminating',
  Unknown = 'Unknown',
  ScaledTo0 = 'Scaled to 0',
  Idle = 'Idle',
  AutoScaledTo0 = 'Autoscaled to 0',
  ScalingUp = 'Scaling Up',
  CrashLoopBackOff = 'CrashLoopBackOff',
}

export const podColor = {
  [AllPodStatus.Running]: '#0066CC',
  [AllPodStatus.NotReady]: '#519DE9',
  [AllPodStatus.Warning]: globalWarning100.value,
  [AllPodStatus.Empty]: globalWhite.value,
  [AllPodStatus.Failed]: '#CC0000',
  [AllPodStatus.Pending]: '#8BC1F7',
  [AllPodStatus.Succeeded]: '#519149',
  [AllPodStatus.Terminating]: '#002F5D',
  [AllPodStatus.Unknown]: globalPurple300.value,
  [AllPodStatus.ScaledTo0]: globalWhite.value,
  [AllPodStatus.Idle]: globalWhite.value,
  [AllPodStatus.AutoScaledTo0]: globalWhite.value,
  [AllPodStatus.ScalingUp]: globalWhite.value,
  [AllPodStatus.CrashLoopBackOff]: '#CC0000',
};

export type ExtPodPhase =
  | AllPodStatus.Empty
  | AllPodStatus.Warning
  | AllPodStatus.Idle
  | AllPodStatus.NotReady
  | AllPodStatus.ScaledTo0
  | AllPodStatus.AutoScaledTo0
  | AllPodStatus.Terminating
  | AllPodStatus.ScalingUp;

export type ExtPodStatus = {
  phase: ExtPodPhase | PodPhase;
};

export type ExtPodKind = {
  status?: ExtPodStatus;
} & K8sResourceKind;

export type OverviewItemAlerts = {
  [key: string]: {
    message: string;
    severity: string;
  };
};

export type PodControllerOverviewItem = {
  alerts: OverviewItemAlerts;
  revision: number;
  obj: K8sResourceKind;
  phase?: string;
  pods: ExtPodKind[];
};

export interface PodRCData {
  current: PodControllerOverviewItem;
  previous: PodControllerOverviewItem;
  obj?: K8sResourceKind;
  isRollingOut: boolean;
  pods: ExtPodKind[];
}

type ContainerStateValue = {
  reason?: string;
  [key: string]: any;
};

export type ContainerState = {
  waiting?: ContainerStateValue;
  running?: ContainerStateValue;
  terminated?: ContainerStateValue;
};

export type ContainerStatus = {
  name: string;
  state?: ContainerState;
  lastState?: ContainerState;
  ready: boolean;
  restartCount: number;
  image: string;
  imageID: string;
  containerID?: string;
};

export type PodCondition = {
  lastProbeTime?: string;
} & K8sResourceCondition;

export type PodStatus = {
  phase: PodPhase;
  conditions?: PodCondition[];
  message?: string;
  reason?: string;
  startTime?: string;
  initContainerStatuses?: ContainerStatus[];
  containerStatuses?: ContainerStatus[];
  [key: string]: any;
};

export type PodTemplate = {
  metadata: ObjectMetadata;
  spec: PodSpec;
};

export type PodKind = {
  status?: PodStatus;
} & K8sResourceCommon &
  PodTemplate;

export enum DEPLOYMENT_PHASE {
  new = 'New',
  running = 'Running',
  pending = 'Pending',
  complete = 'Complete',
  failed = 'Failed',
  cancelled = 'Cancelled',
}

export enum DEPLOYMENT_STRATEGY {
  rolling = 'Rolling',
  recreate = 'Recreate',
  rollingUpdate = 'RollingUpdate',
}

export type DeploymentStrategy = DEPLOYMENT_STRATEGY.recreate | DEPLOYMENT_STRATEGY.rolling;
