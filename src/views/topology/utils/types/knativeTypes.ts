import { K8sResourceCondition } from '@kubevirt-utils/types/k8sTypes';
import { K8sKind } from '@openshift-console/dynamic-plugin-sdk';

import { K8sResourceKind } from '../../../clusteroverview/utils/types';

import { PodKind } from './podTypes';

export enum ConditionTypes {
  Ready = 'Ready',
  Active = 'Active',
  ContainerHealthy = 'ContainerHealthy',
  ResourcesAvailable = 'ResourcesAvailable',
}

export type RevisionCondition = {
  type: keyof typeof ConditionTypes;
} & K8sResourceCondition;

export type RevisionKind = {
  status?: {
    conditions?: RevisionCondition[];
  };
} & K8sResourceKind;

export type Traffic = {
  revisionName: string;
  percent: number;
  latestRevision?: boolean;
  tag?: string;
  url?: string;
};

export type ServiceKind = K8sResourceKind & {
  metadata?: {
    generation?: number;
  };
  status?: {
    url?: string;
    traffic?: Traffic[];
  };
};

export type RouteKind = {
  status: {
    url: string;
    traffic: Traffic[];
  };
} & K8sResourceKind;

export type EventChannelKind = {
  metadata?: {
    generation?: number;
  };
  status: {
    address: {
      url: string;
    };
  };
} & K8sResourceKind;

export type EventSubscriptionKind = {
  metadata?: {
    generation?: number;
  };
  spec: {
    channel: {
      apiVersion: string;
      kind: string;
      name: string;
    };
    subscriber: {
      ref?: {
        apiVersion: string;
        kind: string;
        name: string;
      };
    };
  };
  status: {
    physicalSubscription: {
      subscriberURI: string;
    };
  };
} & K8sResourceKind;

export enum TriggerConditionTypes {
  Ready = 'Ready',
  BrokerReady = 'BrokerReady',
  DependencyReady = 'DependencyReady',
  SubscriptionReady = 'SubscriptionReady',
  SubscriberResolved = 'SubscriberResolved',
}

export type TriggerCondition = {
  type: keyof typeof TriggerConditionTypes;
} & K8sResourceCondition;

export type EventTriggerKind = {
  metadata?: {
    generation?: number;
  };
  spec: {
    broker: string;
    filter: {
      attributes?: {
        [key: string]: string;
      };
    };
    subscriber: {
      ref: {
        apiVersion: string;
        kind: string;
        name: string;
      };
    };
  };
  status?: {
    conditions?: TriggerCondition[];
  };
} & K8sResourceKind;

export interface EventSourceData {
  loaded: boolean;
  eventSourceModels: K8sKind[];
  eventSourceChannels?: K8sKind[];
}

export type KnativeItem = {
  revisions?: K8sResourceKind[];
  configurations?: K8sResourceKind[];
  ksroutes?: K8sResourceKind[];
  ksservices?: K8sResourceKind[];
  eventSources?: K8sResourceKind[];
  eventingsubscription?: K8sResourceKind[];
  eventSourceCronjob?: K8sResourceKind[];
  eventSourceContainers?: K8sResourceKind[];
  eventSourceApiserver?: K8sResourceKind[];
  eventSourceCamel?: K8sResourceKind[];
  eventSourceKafka?: K8sResourceKind[];
  eventSourceSinkbinding?: K8sResourceKind[];
  domainMappings?: K8sResourceKind[];
  pods?: PodKind[];
  associatedDeployment?: K8sResourceKind;
};

export type KnativeUtil = (dc: K8sResourceKind, props) => KnativeItem | undefined;
