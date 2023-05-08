import { K8sResourceCommon, Selector } from '@openshift-console/dynamic-plugin-sdk';

import { K8sResourceCondition } from '../../../clusteroverview/utils/types';

type HPAScalingPolicy = {
  hpaScalingPolicyType: 'Pods' | 'Percent';
  value: number;
  periodSeconds: number;
};

type CurrentObject = {
  averageUtilization?: number;
  averageValue?: string;
  value?: string;
};

type MetricObject = {
  name: string;
  selector?: Selector;
};

type DescribedObject = {
  apiVersion?: string;
  kind: string;
  name: string;
};

type TargetObject = {
  averageUtilization?: number;
  type: string;
  averageValue?: string;
  value?: string;
};

type HPAScalingRules = {
  stabilizationWindowSeconds?: number;
  selectPolicy?: 'Max' | 'Min' | 'Disabled';
  policies?: HPAScalingPolicy[];
};

type HPACurrentMetrics = {
  type: 'Object' | 'Pods' | 'Resource' | 'External';
  external?: {
    current: CurrentObject;
    metric: MetricObject;
  };
  object?: {
    current: CurrentObject;
    describedObject: DescribedObject;
    metric: MetricObject;
  };
  pods?: {
    current: CurrentObject;
    metric: MetricObject;
  };
  resource?: {
    name: string;
    current: CurrentObject;
  };
};

export type HPAMetric = {
  type: 'Object' | 'Pods' | 'Resource' | 'External';
  resource?: {
    name: string;
    target: TargetObject;
  };
  external?: {
    metric: MetricObject;
    target: TargetObject;
  };
  object?: {
    describedObjec: DescribedObject;
    metric: MetricObject;
    target: TargetObject;
  };
  pods?: {
    metric: MetricObject;
    target: TargetObject;
  };
};

export type NodeCondition = {
  lastHeartbeatTime?: string;
} & K8sResourceCondition;

export type HorizontalPodAutoscalerKind = K8sResourceCommon & {
  spec: {
    scaleTargetRef: {
      apiVersion: string;
      kind: string;
      name: string;
    };
    minReplicas?: number;
    maxReplicas: number;
    metrics?: HPAMetric[];
    behavior?: {
      scaleUp?: HPAScalingRules;
      scaleDown?: HPAScalingRules;
    };
  };
  status?: {
    currentReplicas: number;
    desiredReplicas: number;
    currentMetrics?: HPACurrentMetrics[];
    conditions: NodeCondition[];
    lastScaleTime?: string;
  };
};
