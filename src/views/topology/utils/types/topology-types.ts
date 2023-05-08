import React from 'react';

import { K8sResourceKindReference } from '@openshift-console/dynamic-plugin-sdk';
import {
  OverviewItem,
  TopologyDataResources,
} from '@openshift-console/dynamic-plugin-sdk/lib/extensions/topology-types';
import {
  EdgeModel,
  EventListener,
  Graph,
  GraphElement,
  Model,
  ModelKind,
  Node,
  NodeModel,
  TopologyQuadrant,
} from '@patternfly/react-topology';

import { K8sResourceKind } from '../../../clusteroverview/utils/types';

import { KnativeItem } from './knativeTypes';
import { AllPodStatus, PodControllerOverviewItem } from './podTypes';

export enum NodeType {
  EventSource = 'event-source',
  EventSink = 'event-sink',
  KnService = 'knative-service',
  Revision = 'knative-revision',
  PubSub = 'event-pubsub',
  SinkUri = 'sink-uri',
  EventSourceKafka = 'event-source-kafka',
  Kafka = 'knative-kafka',
  KafkaSink = 'kafka-sink',
}

export enum EdgeType {
  Traffic = 'revision-traffic',
  EventSource = 'event-source-link',
  EventSink = 'event-sink-link',
  EventPubSubLink = 'event-pubsub-link',
  EventSourceKafkaLink = 'event-source-kafka-link',
}

export enum KameletType {
  Sink = 'Sink',
  Source = 'Source',
}

export type Subscriber = {
  kind: string;
  name: string;
  namespace: string;
  data: {
    kind: string;
    name: string;
    namespace: string;
    filters: { key: string; value: string }[];
  }[];
};

export type PubsubNodes = {
  channels: {
    apiVersion: string;
    name: string;
    kind: string;
  }[];
  brokers: string[];
};

export type KnativeServiceOverviewItem = OverviewItem &
  KnativeItem & {
    subscribers?: Subscriber[];
    current?: PodControllerOverviewItem;
    previous?: PodControllerOverviewItem;
    isRollingOut?: boolean;
  };

export interface KnativeTopologyDataObject<O extends OverviewItem, D = {}>
  extends TopologyDataObject<D> {
  resources: O;
}

export type Point = [number, number];

export interface OdcNodeModel extends NodeModel {
  resource?: K8sResourceKind;
  resourceKind?: K8sResourceKindReference;
}

export interface OdcEdgeModel extends EdgeModel {
  resource?: K8sResourceKind;
  resourceKind?: K8sResourceKindReference;
}

export type TopologyResourcesObject = { [key: string]: K8sResourceKind[] };

export type TopologyDataModelGetter = (
  namespace: string,
  resources: TopologyDataResources,
  workloads: K8sResourceKind[],
) => Promise<Model>;

export enum TopologyViewType {
  graph = 'graph',
  list = 'list',
}
export type ViewComponentFactory = (
  kind: ModelKind,
  type: string,
  view?: TopologyViewType,
) => React.ComponentType<{ element: GraphElement }> | undefined;

export type TopologyDataModelDepicted = (resource: K8sResourceKind, model: Model) => boolean;

export type TopologyDataModelReconciler = (model: Model, resources: TopologyDataResources) => void;

export type CreateConnection = (
  source: Node,
  target: Node | Graph,
) => Promise<React.ReactElement[] | null>;

export type CreateConnectionGetter = (
  createHints: string[],
  source?: Node,
  target?: Node,
) => CreateConnection;

export enum TopologyDisplayFilterType {
  show = 'show',
  expand = 'expand',
  kind = 'kind',
}

export type TopologyDisplayOption = {
  type: TopologyDisplayFilterType;
  id: string;
  label?: string;
  labelKey?: string;
  priority: number;
  value: boolean;
};

export type DisplayFilters = TopologyDisplayOption[];

// Applies the filters on the model and returns the ids of filters that were relevant
export type TopologyApplyDisplayOptions = (model: Model, filters: DisplayFilters) => string[];

export type TopologyDecoratorGetter = (
  element: Node,
  radius: number,
  centerX: number,
  centerY: number,
) => React.ReactElement;

export type TopologyDecorator = {
  id: string;
  priority: number;
  quadrant: TopologyQuadrant;
  decorator: TopologyDecoratorGetter;
};

export type PodPhase = string;

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

// eslint-disable-next-line @typescript-eslint/ban-types
export interface TopologyDataObject<D = {}> {
  id: string;
  name: string;
  type: string;
  resources: OverviewItem;
  pods?: ExtPodKind[];
  data: D;
  resource: K8sResourceKind | null;
  groupResources?: OdcNodeModel[];
}

export interface TopologyApplicationObject {
  id: string;
  name: string;
  resources: OdcNodeModel[];
}

export interface WorkloadData {
  editURL?: string;
  vcsURI?: string;
  vcsRef?: string;
  builderImage?: string;
  kind?: string;
  isKnativeResource?: boolean;
}

export type TrafficData = {
  nodes: KialiNode[];
  edges: KialiEdge[];
};

export type KialiNode = {
  data: {
    id: string;
    nodeType: string;
    namespace: string;
    workload: string;
    app: string;
    version?: string;
    destServices?: { [key: string]: any }[];
    traffic?: { [key: string]: any }[];
  };
};

export type KialiEdge = {
  data: {
    id: string;
    source: string;
    target: string;
    traffic: { [key: string]: any };
  };
};

export type BuildConfigOverviewItem = K8sResourceKind & {
  builds: K8sResourceKind[];
};

export type GraphData = {
  namespace: string;
  createResourceAccess: string[];
  eventSourceEnabled: boolean;
  createConnectorExtensions?: CreateConnectionGetter[];
  decorators?: { [key: string]: TopologyDecorator[] };
};

export const SHOW_GROUPING_HINT_EVENT = 'show-regroup-hint';
export type ShowGroupingHintEventListener = EventListener<[Node, string]>;

export interface RevisionDataMap {
  [id: string]: TopologyDataObject;
}
