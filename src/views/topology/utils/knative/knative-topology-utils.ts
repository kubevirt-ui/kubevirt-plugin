import i18next from 'i18next';
import partition from 'lodash.partition';
import { K8sResourceKind } from 'src/views/clusteroverview/utils/types';

import { DeploymentModel, PodModel, ServiceModel } from '@kubevirt-ui/kubevirt-api/console';
import { getAPIVersionForModel, getName } from '@kubevirt-utils/resources/shared';
import { get, isEmpty } from '@kubevirt-utils/utils/utils';
import {
  getGroupVersionKindForModel,
  getGroupVersionKindForResource,
  WatchK8sResultsObject,
} from '@openshift-console/dynamic-plugin-sdk';
import {
  OverviewItem,
  TopologyDataObject,
  TopologyDataResources,
} from '@openshift-console/dynamic-plugin-sdk/lib/extensions/topology-types';
import { EdgeModel, EdgeStyle, Model, NodeModel, NodeShape } from '@patternfly/react-topology';

import { NODE_HEIGHT, NODE_PADDING, NODE_WIDTH } from '../../const';
import {
  createTopologyNodeData,
  getTopologyGroupItems,
  getTopologyNodeItem,
  mergeGroup,
  WorkloadModelProps,
} from '../../data-transforms/transform-utils';
import { getDynamicEventSourcesModelRefs } from '../hooks/isOperatorBackedResource/utils/utils';
import { getOwnedResources } from '../hooks/useBuildsConfigWatcher/utils/utils';
import {
  apiGroupForReference,
  getReferenceForResource,
  groupVersionFor,
  kindForReference,
} from '../k8s-utils';
import {
  CamelKameletBindingModel,
  EventingBrokerModel,
  EventingTriggerModel,
} from '../knative-models';
import { filterBasedOnActiveApplication } from '../topology-utils';
import { KnativeItem, KnativeUtil } from '../types/knativeTypes';
import {
  EdgeType,
  KameletType,
  KnativeServiceOverviewItem,
  KnativeTopologyDataObject,
  NodeType,
  PubsubNodes,
  RevisionDataMap,
  Subscriber,
} from '../types/topology-types';

import { getDynamicChannelModelRefs } from './fetch-dynamic-eventsources-utils';
import {
  EVENT_SOURCE_CAMEL_KIND,
  EVENT_SOURCE_SINK_BINDING_KIND,
  FLAG_KNATIVE_EVENTING,
  KNATIVE_GROUP_NODE_HEIGHT,
  KNATIVE_GROUP_NODE_PADDING,
  KNATIVE_GROUP_NODE_WIDTH,
  URI_KIND,
} from './knative-const';

export const getKnNodeModelProps = (type: string) => {
  switch (type) {
    case NodeType.EventSource:
    case NodeType.EventSink:
    case NodeType.EventSourceKafka:
    case NodeType.KafkaSink:
      return {
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        visible: true,
        shape: NodeShape.rhombus,
        style: {
          padding: NODE_PADDING,
        },
      };
    case NodeType.KnService:
      return {
        width: KNATIVE_GROUP_NODE_WIDTH,
        height: KNATIVE_GROUP_NODE_HEIGHT,
        visible: true,
        collapsed: false,
        group: true,
        shape: NodeShape.rect,
        style: {
          padding: KNATIVE_GROUP_NODE_PADDING,
        },
      };
    case NodeType.PubSub:
      return {
        width: NODE_WIDTH,
        height: NODE_HEIGHT / 2,
        visible: true,
        shape: NodeShape.stadium,
        style: {
          padding: NODE_PADDING,
        },
      };
    case NodeType.SinkUri:
      return {
        width: NODE_WIDTH * 0.75,
        height: NODE_HEIGHT * 0.75,
        visible: true,
        shape: NodeShape.circle,
        style: {
          padding: NODE_PADDING,
        },
      };
    default:
      return WorkloadModelProps;
  }
};

/**
 * returns if event source is enabled or not
 * @param Flags
 */
export const getEventSourceStatus = ({ FLAGS }: RootState): boolean =>
  FLAGS.get(FLAG_KNATIVE_EVENTING);

/**
 * fetch the parent resource from a resource
 * @param resource
 * @param resources
 */
export const getParentResource = (
  resource: K8sResourceKind,
  resources: K8sResourceKind[],
): K8sResourceKind => {
  const parentUids = get(resource, ['metadata', 'ownerReferences'], [])?.map((owner) => owner.uid);
  const [resourcesParent] = resources?.filter(({ metadata: { uid } }) => parentUids.includes(uid));
  return resourcesParent;
};

/**
 * Filters revision based on active application
 * @param revisions
 * @param resources
 * @param application
 */
export const filterRevisionsByActiveApplication = (
  revisions: K8sResourceKind[],
  resources: TopologyDataResources,
  application: string,
) => {
  const filteredRevisions = [];
  revisions?.forEach((revision) => {
    const configuration = getParentResource(revision, resources.configurations.data);
    const service = getParentResource(configuration, resources.ksservices.data);
    const hasTraffic =
      service &&
      service.status &&
      service.status.traffic?.find((item) => item?.revisionName === revision.metadata.name);
    const isServicePartofGroup = filterBasedOnActiveApplication([service], application).length > 0;
    if (hasTraffic && isServicePartofGroup) {
      filteredRevisions.push(revision);
    }
  });
  return filteredRevisions;
};
export const isInternalResource = (resource: K8sResourceKind): boolean => {
  return resource.kind !== EventingBrokerModel.kind && !!resource.metadata?.ownerReferences;
};

const isSubscriber = (
  resource: K8sResourceKind,
  relatedResource: K8sResourceKind,
  mainResource: K8sResourceKind,
): boolean => {
  const subscriberRef = relatedResource?.spec?.subscriber?.ref;
  // check for channel reference as channel with different kind can have same name
  const channelRef = relatedResource?.spec?.channel;
  if (
    channelRef &&
    (mainResource.metadata.name !== channelRef.name ||
      mainResource.kind !== channelRef.kind ||
      mainResource.apiVersion !== channelRef.apiVersion)
  ) {
    return false;
  }
  return (
    subscriberRef &&
    getGroupVersionKindForResource(resource) === subscriberRef.apiVersion &&
    resource.metadata.name === subscriberRef.name
  );
};

const isPublisher = (
  relatedResource: K8sResourceKind,
  relationshipResource: K8sResourceKind,
  mainResource: K8sResourceKind,
): boolean => {
  const { name, kind, apiVersion } = relationshipResource.spec?.subscriber?.ref || {};
  if (
    mainResource.metadata.name !== name ||
    mainResource.kind !== kind ||
    mainResource.apiVersion !== apiVersion
  ) {
    return false;
  }
  if (relationshipResource.kind === EventingTriggerModel.kind) {
    return relationshipResource.spec?.broker === relatedResource.metadata.name;
  }
  const channel = relationshipResource.spec?.channel;
  return (
    channel &&
    channel.name === relatedResource.metadata.name &&
    channel.kind === relatedResource.kind &&
    channel.apiVersion === relatedResource.apiVersion
  );
};

export const getTriggerFilters = (resource: K8sResourceKind) => {
  const data = {
    filters: [],
  };
  const attributes = resource?.spec?.filter?.attributes;
  if (attributes && !isEmpty(attributes)) {
    for (const [key, value] of Object.entries(attributes)) {
      data.filters.push({ key, value });
    }
  }
  return data;
};

export const getKnativeDynamicResources = (
  resources: TopologyDataResources,
  dynamicProps: string[],
): K8sResourceKind[] => {
  return dynamicProps.reduce((acc, currProp) => {
    const currPropResource = resources[currProp]?.data ?? [];
    return [...acc, ...currPropResource];
  }, []);
};

export const getSubscribedEventsources = (
  pubSubResource: K8sResourceKind,
  resources: TopologyDataResources,
) => {
  const eventSourceProps = [...getDynamicEventSourcesModelRefs(), CamelKameletBindingModel.plural];
  return getKnativeDynamicResources(resources, eventSourceProps)?.reduce((acc, evSrc) => {
    const sinkRes = evSrc?.spec?.sink?.ref || {};
    if (
      pubSubResource.kind === sinkRes.kind &&
      pubSubResource.metadata.name === sinkRes.name &&
      pubSubResource.apiVersion === sinkRes.apiVersion
    ) {
      acc.push(evSrc);
    }
    return acc;
  }, []);
};

/**
 * Get the subscribers for broker, channels and knative service
 * @param resource
 * @param resources
 */
export const getPubSubSubscribers = (
  resource: K8sResourceKind,
  resources: TopologyDataResources,
): Subscriber[] | [] => {
  const channelResourceProps = getDynamicChannelModelRefs();

  const relationShipMap = {
    Broker: [
      {
        relatedResource: 'ksservices',
        relationshipResource: 'triggers',
        isRelatedResource: isSubscriber,
      },
      {
        relatedResource: 'services',
        relationshipResource: 'triggers',
        isRelatedResource: isSubscriber,
      },
      {
        relatedResource: 'kafkasinks',
        relationshipResource: 'triggers',
        isRelatedResource: isSubscriber,
      },
    ],
    Service: [
      {
        relatedResource: 'brokers',
        relationshipResource: 'triggers',
        isRelatedResource: isPublisher,
      },
    ],
  };
  channelResourceProps?.forEach((channel) => {
    relationShipMap.Service.push({
      relatedResource: channel,
      relationshipResource: 'eventingsubscription',
      isRelatedResource: isPublisher,
    });
    relationShipMap[channel] = [
      {
        relatedResource: 'ksservices',
        relationshipResource: 'eventingsubscription',
        isRelatedResource: isSubscriber,
      },
      {
        relatedResource: 'services',
        relationshipResource: 'eventingsubscription',
        isRelatedResource: isSubscriber,
      },
      {
        relatedResource: 'kafkasinks',
        relationshipResource: 'eventingsubscription',
        isRelatedResource: isSubscriber,
      },
    ];
  });

  let subscribers = [];
  if (relationShipMap[resource.kind] || relationShipMap[getReferenceForResource(resource)]) {
    const depicters =
      relationShipMap[resource.kind] || relationShipMap[getReferenceForResource(resource)];
    depicters?.forEach((depicter) => {
      const { relatedResource, relationshipResource, isRelatedResource } = depicter;
      if (resources[relatedResource] && resources[relatedResource].data?.length > 0) {
        subscribers = subscribers.concat(
          resources[relatedResource].data?.reduce((acc, relRes) => {
            if (
              (getGroupVersionKindForResource(relRes) !==
                getGroupVersionKindForModel(ServiceModel) &&
                isInternalResource(relRes)) ||
              !isRelatedResource
            ) {
              return acc;
            }
            const relationshipResources = (resources[relationshipResource].data || []).filter(
              (relationshipRes) => {
                return isRelatedResource(relRes, relationshipRes, resource);
              },
            );
            const relationShipData = relationshipResources.map((res) => {
              return {
                kind: getReferenceForResource(res),
                name: res.metadata.name,
                namespace: res.metadata.namespace,
                ...getTriggerFilters(res),
              };
            });
            if (relationShipData.length > 0) {
              const obj = {
                kind: getReferenceForResource(relRes),
                name: relRes.metadata.name,
                namespace: relRes.metadata.namespace,
                data: relationShipData,
              };
              acc.push(obj);
            }
            return acc;
          }, []),
        );
      }
    });
  }
  return subscribers;
};
/**
 * partition and return the array of channels and brokers
 * @param subscribers
 */
export const getSubscriberByType = (
  subscribers: Subscriber[] = [],
): [Subscriber[], Subscriber[]] => {
  if (subscribers.length === 0) {
    return [[], []];
  }
  const channelResourceProps = getDynamicChannelModelRefs();
  return partition(subscribers, (sub) => channelResourceProps.includes(sub.kind));
};

/**
 * return the dynamic channel reference
 * @param kind
 */
const getChannelRef = (kind: string): string => {
  const channelResourceProps = getDynamicChannelModelRefs();
  return channelResourceProps?.find((channel) => {
    return kind === kindForReference(channel);
  });
};

/**
 * Get the knative service subscriptions
 * @param ksvc Knative Service
 * @param resources
 */
export const getSubscribedPubSubNodes = (
  ksvc: K8sResourceKind,
  resources: TopologyDataResources,
): K8sResourceKind[] => {
  const pubsubConnectors = ['triggers', 'eventingsubscription'];
  const pubsubNodes: PubsubNodes = { channels: [], brokers: [] };
  pubsubConnectors.forEach((connector: string) => {
    if (resources[connector] && resources[connector].data.length > 0) {
      const pubsubConnectorResources = resources[connector].data;
      pubsubConnectorResources?.map((connectorRes) => {
        if (!isInternalResource(connectorRes)) {
          const subscriber = connectorRes?.spec?.subscriber?.ref;
          if (subscriber) {
            const subscribedService =
              ksvc.kind === subscriber.kind && ksvc.metadata.name === subscriber.name;
            if (subscribedService && connectorRes.kind === EventingTriggerModel.kind) {
              const broker = connectorRes.spec?.broker;
              if (!pubsubNodes.brokers.includes(broker)) {
                pubsubNodes.brokers.push(broker);
              }
            } else if (subscribedService) {
              const channel = connectorRes.spec?.channel;
              const { apiVersion, name, kind } = channel || {};

              const channelAdded = pubsubNodes.channels?.find(
                (chnl) =>
                  chnl?.apiVersion === apiVersion && chnl?.name === name && chnl?.kind === kind,
              );
              if (channel && !channelAdded) {
                pubsubNodes.channels.push(channel);
              }
            }
          }
        }
      });
    }
  });
  const eventSources = [];
  const pushEventSource = (evsrc: K8sResourceKind) => {
    const evsrcFound = eventSources?.find(
      (eventSource) =>
        eventSource?.kind === evsrc.kind && getName(eventSource) === evsrc?.metadata?.name,
    );
    if (!evsrcFound) {
      eventSources.push(evsrc);
    }
  };
  pubsubNodes.brokers.forEach((broker) => {
    const eventBroker = resources.brokers.data?.find((res) => getName(res) === broker);
    const evsrcs = eventBroker ? getSubscribedEventsources(eventBroker, resources) : [];
    evsrcs?.forEach((evsrc) => {
      pushEventSource(evsrc);
    });
  });
  pubsubNodes.channels.forEach((channel) => {
    const channelKind = getChannelRef(channel.kind);
    const channelResources = resources[channelKind];
    if (channelResources) {
      const eventingChannel = channelResources.data?.find(
        (data) => getName(data) === channel.name && data?.kind === channel.kind,
      );
      const evsrcs = eventingChannel ? getSubscribedEventsources(eventingChannel, resources) : [];
      evsrcs.forEach((evsrc) => {
        pushEventSource(evsrc);
      });
    }
  });

  getSubscribedEventsources(ksvc, resources).forEach((evsrc) => {
    pushEventSource(evsrc);
  });
  return eventSources;
};

export const getKnativeRevisionsData = (
  resource: K8sResourceKind,
  resources: TopologyDataResources,
) => {
  const configurations = getOwnedResources(resource, resources.configurations?.data);
  const revisions =
    configurations && configurations.length
      ? getOwnedResources(configurations[0], resources.revisions?.data)
      : [];
  return revisions;
};

/**
 * Forms data with respective revisions, configurations, routes based on kntaive service
 */
export const getKnativeServiceData = (
  resource: K8sResourceKind,
  resources: TopologyDataResources,
  utils?: KnativeUtil[],
): KnativeItem => {
  const configurations = getOwnedResources(resource, resources.configurations?.data);
  const revisions = getKnativeRevisionsData(resource, resources);
  const ksroutes = resources.ksroutes
    ? getOwnedResources(resource, resources.ksroutes?.data)
    : undefined;
  const eventSources = getSubscribedPubSubNodes(resource, resources);
  const overviewItem: KnativeItem = {
    revisions,
    configurations,
    ksroutes,
    eventSources,
  };
  if (utils) {
    return utils.reduce((acc, util) => {
      return { ...acc, ...util(resource, resources) };
    }, overviewItem);
  }
  return overviewItem;
};

export const getDeploymentsForKamelet = (
  resource: K8sResourceKind,
  resources: TopologyDataResources,
): K8sResourceKind[] => {
  if (
    [EVENT_SOURCE_CAMEL_KIND, CamelKameletBindingModel.kind].includes(resource.kind) &&
    resources.integrations
  ) {
    const integrationsOwnData = getOwnedResources(resource, resources.integrations.data);
    const associatedDeployment =
      integrationsOwnData?.length > 0
        ? getOwnedResources(integrationsOwnData[0], resources.deployments?.data)
        : [];
    return associatedDeployment;
  }
  return [];
};

/**
 * Rollup data for deployments for revisions, event sources, event sinks
 */
export const createKnativeDeploymentItems = (
  resource: K8sResourceKind,
  resources: TopologyDataResources,
  utils?: KnativeUtil[],
): KnativeServiceOverviewItem => {
  let associatedDeployment = getOwnedResources(resource, resources.deployments.data);
  associatedDeployment = [
    ...associatedDeployment,
    ...getDeploymentsForKamelet(resource, resources),
  ];
  if (!isEmpty(associatedDeployment)) {
    const depObj: K8sResourceKind = {
      ...associatedDeployment[0],
      apiVersion: getAPIVersionForModel(DeploymentModel),
      kind: DeploymentModel.kind,
    };
    const overviewItems: KnativeServiceOverviewItem = {
      obj: resource,
      associatedDeployment: depObj,
    };

    if (utils) {
      return utils.reduce((acc, util) => {
        return { ...acc, ...util(resource, resources) };
      }, overviewItems);
    }

    return overviewItems;
  }
  const subscribers = getPubSubSubscribers(resource, resources);
  const knResources = getKnativeServiceData(resource, resources, utils);
  return {
    obj: resource,
    subscribers,
    ...knResources,
  };
};

export const createPubSubDataItems = (
  resource: K8sResourceKind,
  resources: TopologyDataResources,
): KnativeServiceOverviewItem => {
  const {
    kind: resKind,
    metadata: { name },
    spec,
  } = resource;
  const channelProps = getDynamicChannelModelRefs();
  const depChannelResources = getOwnedResources(
    resource,
    getKnativeDynamicResources(resources, channelProps),
  );
  const subscriptionData = resources?.eventingsubscription?.data ?? [];
  const triggerList = resources?.triggers?.data ?? [];
  let triggersData = {};
  const eventSources = getSubscribedEventsources(resource, resources);
  const channelSubsData = subscriptionData?.reduce(
    (acc, subs) => {
      const subUid = get(subs, 'metadata.uid');
      const subscribers = spec?.subscribable?.subscribers || spec?.subscribers;
      const isSubscribableData = subscribers?.findIndex(({ uid }) => {
        return uid === subUid;
      });
      if (isSubscribableData !== -1) {
        acc.eventingsubscription.push(subs);
        const subscriptionSvc = get(subs, 'spec.subscriber.ref', null);
        resources?.ksservices?.data?.forEach((svc) => {
          if (svc.kind === subscriptionSvc?.kind && svc.metadata.name === subscriptionSvc?.name) {
            acc.ksservices.push(svc);
          }
        });
      }
      return acc;
    },
    { eventingsubscription: [], ksservices: [] },
  );

  if (resKind === EventingBrokerModel.kind) {
    triggersData = triggerList?.reduce(
      (tData, trigger) => {
        const brokerName = trigger?.spec?.broker;
        const knService = resources?.ksservices?.data?.find(
          (svc) =>
            getName(svc) === trigger?.spec?.subscriber?.ref?.name &&
            svc?.kind === trigger?.spec?.subscriber?.ref?.kind &&
            svc?.apiVersion === trigger?.spec?.subscriber?.ref?.apiVersion,
        );
        const knServiceAdded =
          knService &&
          tData.ksservices?.filter((ksvc) => ksvc.metadata.name === knService.metadata.name)
            .length > 0;
        if (name === brokerName) {
          tData.triggers = [...tData.triggers, trigger];
          tData.ksservices =
            knService && !knServiceAdded ? [...tData.ksservices, knService] : tData.ksservices;
        }

        return tData;
      },
      { ksservices: [], triggers: [], pods: [], deployments: [] },
    );
    [PodModel, DeploymentModel].forEach(({ kind, plural: resType }) => {
      triggersData[resType] = resources?.[resType]?.data
        .filter((resourceObject) => {
          return resourceObject?.metadata?.labels?.['eventing.knative.dev/broker'] === name;
        })
        .map((obj) => ({ ...obj, ...{ kind } }));
    });
  }

  return {
    obj: resource,
    ...(depChannelResources && { channels: depChannelResources }),
    eventSources,
    ...channelSubsData,
    ...triggersData,
    subscribers: getPubSubSubscribers(resource, resources),
  };
};

/**
 * only get revisions which are included in traffic data
 */
export const filterRevisionsBaseOnTrafficStatus = (
  resource: K8sResourceKind,
  revisions: K8sResourceKind[],
): K8sResourceKind[] => {
  if (!get(resource, 'status.traffic', null)) return undefined;
  return resource.status.traffic.reduce((acc, curr) => {
    const el = revisions.find((rev) => curr.revisionName === rev.metadata.name);
    return el ? [...acc, el] : acc;
  }, []);
};

/**
 * Form Node data for revisions/event/service sources
 */
export const getKnativeTopologyNodeItems = (
  resource: K8sResourceKind,
  type: string,
  data: TopologyDataObject,
  resources?: TopologyDataResources,
): NodeModel[] => {
  const nodes = [];
  const children: string[] = [];
  if (type === NodeType.KnService && resources && resources.configurations) {
    const configurations = getOwnedResources(resource, resources.configurations.data);
    const configUidData = get(configurations[0], ['metadata', 'uid']);
    const ChildData = resources.revisions.data?.filter((revision) =>
      revision?.metadata?.ownerReferences?.some((ref) => ref?.uid === configUidData),
    );
    filterRevisionsBaseOnTrafficStatus(resource, ChildData)?.forEach((c) => {
      const uidRev = c.metadata.uid;
      children.push(uidRev);
      nodes.push(
        getTopologyNodeItem(c, NodeType.Revision, null, getKnNodeModelProps(NodeType.Revision)),
      );
    });
  }
  nodes.push(getTopologyNodeItem(resource, type, data, getKnNodeModelProps(type), children));
  return nodes;
};

export const getSinkUriTopologyNodeItems = (
  type: string,
  id: string,
  data: TopologyDataObject,
): NodeModel[] => {
  const nodes = [];
  const nodeProps = getKnNodeModelProps(type);
  nodes.push({
    id,
    type,
    resource: data.resource,
    resourceKind: 'URI',
    data,
    ...(nodeProps || {}),
  });
  return nodes;
};

export const getSinkUriTopologyEdgeItems = (
  resource: K8sResourceKind,
  targetUid: string,
): EdgeModel[] => {
  const uid = resource?.metadata?.uid;
  const sinkUri = resource?.spec?.sink?.uri;
  const edges = [];
  if (sinkUri && uid) {
    edges.push({
      id: `${uid}_${targetUid}`,
      type: EdgeType.EventSource,
      label: i18next.t('kubevirt-plugin~Event source connector'),
      source: uid,
      target: targetUid,
    });
  }
  return edges;
};

const getSinkTargetUid = (nodeData: NodeModel[], sinkUri: string) => {
  const sinkNodeData = nodeData?.find(({ data: nodeResData }) => {
    return sinkUri === nodeResData?.data?.sinkUri;
  });

  return sinkNodeData?.id ?? '';
};

const getEventSourcesData = (sinkUri: string, resources) => {
  const eventSourceProps = [...getDynamicEventSourcesModelRefs(), CamelKameletBindingModel.plural];
  return getKnativeDynamicResources(resources, eventSourceProps)?.reduce((acc, evSrc) => {
    const evSrcSinkUri = evSrc.spec?.sink?.uri || '';
    if (sinkUri === evSrcSinkUri) {
      acc.push(evSrc);
    }
    return acc;
  }, []);
};

const getApiGroup = (apiVersion: string) => groupVersionFor(apiVersion)?.group;

export const getEventSinkTopologyEdgeItems = (resource: K8sResourceKind, resources) => {
  const targetUid = resource?.metadata?.uid;
  const source = resource?.spec?.source?.ref;
  if (!targetUid || !source) return [];
  let sinkSource;
  const targetRef = getReferenceForResource(source);
  if (source?.kind === EventingBrokerModel.kind) {
    sinkSource = resources.brokers.data.find((broker) => broker.metadata.name === source.name);
  } else {
    sinkSource = resources[targetRef]?.data?.find((res) => res.metadata.name === source.name);
  }

  if (sinkSource) {
    return [
      {
        id: `${sinkSource.metadata.uid}_${targetUid}`,
        type: EdgeType.EventSink,
        label: i18next.t('kubevirt-plugin~Event sink connector'),
        target: targetUid,
        source: sinkSource.metadata.uid,
      },
    ];
  }
  return [];
};

/**
 * Form Edge data for event sources
 */
export const getEventTopologyEdgeItems = (resource: K8sResourceKind, { data }): EdgeModel[] => {
  const uid = resource?.metadata?.uid;
  const sinkTarget = get(resource, 'spec.sink.ref', null) || get(resource, 'spec.sink', null);
  const edges = [];
  if (sinkTarget) {
    data?.forEach((res) => {
      const {
        apiVersion,
        kind,
        metadata: { uid: resUid, name: resName },
      } = res;
      if (
        resName === sinkTarget.name &&
        kind === sinkTarget.kind &&
        getApiGroup(apiVersion) === getApiGroup(sinkTarget.apiVersion)
      ) {
        edges.push({
          id: `${uid}_${resUid}`,
          type: EdgeType.EventSource,
          label: i18next.t('kubevirt-plugin~Event source connector'),
          source: uid,
          target: resUid,
        });
      }
    });
  }
  return edges;
};

/**
 * To fetch the trigger and form the edges in the topology data model.
 * @param broker pass the eventing broker object
 * @param resources pass all the resources
 */
export const getTriggerTopologyEdgeItems = (broker: K8sResourceKind, resources): EdgeModel[] => {
  const {
    metadata: { uid, name },
  } = broker;
  const { triggers, ksservices, kafkasinks } = resources;
  const possibleTargetResources = [
    ...(ksservices?.data.length > 0 ? ksservices.data : []),
    ...(kafkasinks?.data.length > 0 ? kafkasinks.data : []),
  ];
  const edges = [];
  triggers?.data?.forEach((trigger) => {
    const brokerName = trigger?.spec?.broker;
    const connectedResource = trigger.spec?.subscriber?.ref;
    if (name === brokerName && possibleTargetResources.length > 0) {
      const targetResource = (possibleTargetResources as K8sResourceKind[])?.find(
        (res) => getName(res) === connectedResource?.name,
      );
      if (
        targetResource &&
        getApiGroup(connectedResource.apiVersion) ===
          apiGroupForReference(getReferenceForResource(targetResource))
      ) {
        const {
          metadata: { uid: targetUid },
        } = targetResource;
        edges.push({
          id: `${uid}_${targetUid}`,
          type: EdgeType.EventPubSubLink,
          source: uid,
          target: targetUid,
          data: {
            resources: {
              obj: trigger,
              eventSources: getSubscribedEventsources(broker, resources),
              brokers: [broker],
              subscriberRes: [targetResource],
              filters: getTriggerFilters(trigger).filters,
            },
          },
        });
      }
    }
  });
  return edges;
};

export const getSubscriptionTopologyEdgeItems = (
  resource: K8sResourceKind,
  resources,
): EdgeModel[] => {
  const {
    kind,
    metadata: { uid, name },
  } = resource;
  const { eventingsubscription, ksservices, kafkasinks } = resources;
  const possibleTargetResources = [
    ...(ksservices?.data.length > 0 ? ksservices.data : []),
    ...(kafkasinks?.data.length > 0 ? kafkasinks.data : []),
  ];
  const edges = [];
  eventingsubscription?.data?.forEach((subRes) => {
    const channelData = subRes?.spec?.channel;
    if (
      name === channelData?.name &&
      kind === channelData?.kind &&
      possibleTargetResources.length > 0
    ) {
      const svcData = subRes?.spec?.subscriber?.ref;
      svcData &&
        possibleTargetResources?.forEach((res) => {
          const {
            metadata: { uid: resUid, name: resName },
          } = res;
          if (
            resName === svcData.name &&
            groupVersionFor(svcData.apiVersion).group ===
              apiGroupForReference(getReferenceForResource(res))
          ) {
            edges.push({
              id: `${uid}_${resUid}`,
              type: EdgeType.EventPubSubLink,
              source: uid,
              target: resUid,
              data: {
                resources: {
                  obj: subRes,
                  eventSources: getSubscribedEventsources(resource, resources),
                  channels: [resource],
                  subscriberRes: [res],
                },
              },
            });
          }
        });
    }
  });
  return edges;
};

export const getKnSourceKafkaTopologyEdgeItems = (
  kafkaSource: K8sResourceKind,
  kafkaConnections: WatchK8sResultsObject<K8sResourceKind[]>,
): EdgeModel[] => {
  if (!kafkaConnections?.data) {
    return [];
  }
  const { data } = kafkaConnections;
  const edges = data.reduce((acc, kafkaConnection) => {
    const kcServiceAccountSecretName = kafkaConnection?.spec?.credentials?.serviceAccountSecretName;
    const kafkaSourcePasswordSecretKeyRefName =
      kafkaSource.spec?.net?.sasl?.password?.secretKeyRef?.name;
    const kafkaSourceUserSecretKeyRefName = kafkaSource.spec?.net?.sasl?.user?.secretKeyRef?.name;
    const kcBootstrapServerHost = kafkaConnection.status?.bootstrapServerHost;
    if (
      kcServiceAccountSecretName &&
      kcServiceAccountSecretName === kafkaSourcePasswordSecretKeyRefName &&
      kcServiceAccountSecretName === kafkaSourceUserSecretKeyRefName &&
      kcBootstrapServerHost &&
      kafkaSource.spec?.bootstrapServers.includes(kcBootstrapServerHost)
    ) {
      const edgeId = `${kafkaSource?.metadata?.uid}_${kafkaConnection?.metadata?.uid}`;
      acc.push({
        id: edgeId,
        type: EdgeType.EventSourceKafkaLink,
        edgeStyle: EdgeStyle.dashedMd,
        label: i18next.t('kubevirt-plugin~Kafka connector'),
        source: kafkaSource.metadata?.uid,
        target: kafkaConnection.metadata?.uid,
      });
    }
    return acc;
  }, []);
  return edges;
};

/**
 * Form Edge data for service sources with traffic data
 */
export const getTrafficTopologyEdgeItems = (resource: K8sResourceKind, { data }): EdgeModel[] => {
  const uid = get(resource, ['metadata', 'uid']);
  const trafficSvc = get(resource, ['status', 'traffic'], []);
  const edges = [];
  trafficSvc?.forEach((res) => {
    const resname = get(res, ['revisionName']);
    const trafficPercent = get(res, ['percent']);
    const revisionObj = data?.find((rev) => {
      const revname = get(rev, ['metadata', 'name']);
      return revname === resname;
    });
    const resUid = get(revisionObj, ['metadata', 'uid'], null);
    if (resUid) {
      const revisionIndex = edges?.findIndex((edge) => edge.id === `${uid}_${resUid}`);
      if (revisionIndex >= 0) {
        edges[revisionIndex].data.percent += trafficPercent;
      } else {
        edges.push({
          id: `${uid}_${resUid}`,
          type: EdgeType.Traffic,
          label: i18next.t('kubevirt-plugin~Traffic distribution connector'),
          source: uid,
          target: resUid,
          data: { percent: trafficPercent },
        });
      }
    }
  });
  return edges;
};

/**
 * create all data that need to be shown on a topology data for knative service
 */
export const createTopologyServiceNodeData = (
  resource: K8sResourceKind,
  svcRes: OverviewItem,
  type: string,
): TopologyDataObject => {
  const { obj: knativeSvc } = svcRes;
  const uid = get(knativeSvc, 'metadata.uid');
  const labels = get(knativeSvc, 'metadata.labels', {});
  const annotations = get(knativeSvc, 'metadata.annotations', {});
  return {
    id: uid,
    name: get(knativeSvc, 'metadata.name') || labels['app.kubernetes.io/instance'],
    type,
    resource,
    resources: { ...svcRes },
    data: {
      url: knativeSvc.status?.url || '',
      kind: getReferenceForResource(knativeSvc),
      editURL: annotations['app.openshift.io/edit-url'],
      vcsURI: annotations['app.openshift.io/vcs-uri'],
      isKnativeResource: true,
    },
  };
};

export const createTopologyPubSubNodeData = (
  resource: K8sResourceKind,
  res: OverviewItem,
  type: string,
): TopologyDataObject => {
  const {
    obj: {
      metadata: { name, uid, labels },
    },
  } = res;
  return {
    id: uid,
    name: name || labels?.['app.kubernetes.io/instance'],
    type,
    resource,
    resources: { ...res },
    data: {
      kind: referenceFor(res.obj),
      isKnativeResource: true,
    },
  };
};

/**
 * Get the route URL for the matching revision name
 */
export const getRoutesURL = (resource: K8sResourceKind, ksroutes: K8sResourceKind[]): string => {
  if (ksroutes && ksroutes.length > 0 && !isEmpty(ksroutes[0].status)) {
    const trafficData: { [x: string]: any } = ksroutes[0].status.traffic?.find(
      (item) => item?.revisionName === resource?.metadata?.name,
    );
    return trafficData?.url;
  }
  return null;
};

const getOwnedEventSourceData = (
  resource: K8sResourceKind,
  data: TopologyDataObject,
  resources,
) => {
  const eventSourceProps = [...getDynamicEventSourcesModelRefs(), CamelKameletBindingModel.plural];
  const eventSourcesData = getKnativeDynamicResources(resources, eventSourceProps);
  let ownedSourceData = getOwnedResources(resource, eventSourcesData);
  if (resource.kind === CamelKameletBindingModel.kind && resources.integrations?.data?.length > 0) {
    const ownedIntegrationData = getOwnedResources(resource, resources.integrations.data);
    ownedSourceData = ownedIntegrationData?.reduce((acc, res) => {
      const ownRes = getOwnedResources(res, eventSourcesData);
      return [...acc, ...ownRes];
    }, []);
  }
  return {
    ...data,
    resources: { ...data.resources, eventSources: ownedSourceData },
  };
};

const getOwnedEventSinkData = (resource: K8sResourceKind, data: TopologyDataObject, resources) => {
  const ownedIntegrationData = getOwnedResources(resource, resources.integrations?.data);
  const ownedServiceData = getOwnedResources(ownedIntegrationData[0], resources.ksservices?.data);
  const ownedDeploymentData = getOwnedResources(
    ownedIntegrationData[0],
    resources.deployments?.data,
  );
  let knServiceData = {};
  if (ownedServiceData.length > 0) {
    knServiceData = getKnativeServiceData(ownedServiceData[0], resources);
  }
  return {
    ...data,
    resources: {
      ...data.resources,
      integrations: ownedIntegrationData,
      services: ownedServiceData,
      deployments: ownedDeploymentData,
      ...knServiceData,
    },
  };
};

const sinkURIDataModel = (
  resource: K8sResourceKind,
  resources: TopologyDataResources,
  data: TopologyDataObject,
  knDataModel: Model,
) => {
  // form node data for sink uri
  const sinkUri = resource.spec?.sink?.uri;
  let sinkTargetUid = getSinkTargetUid(knDataModel.nodes, sinkUri);
  if (sinkUri) {
    if (!sinkTargetUid) {
      sinkTargetUid = encodeURIComponent(sinkUri);
      const eventSourcesData = getEventSourcesData(sinkUri, resources);
      const sinkUriObj = {
        metadata: {
          uid: sinkTargetUid,
          namespace: data.resources.obj.metadata.namespace || '',
        },
        spec: { sinkUri },
        kind: URI_KIND,
      };
      const sinkData: KnativeTopologyDataObject<KnativeServiceOverviewItem> = {
        id: sinkTargetUid,
        name: 'URI',
        type: NodeType.SinkUri,
        resources: { ...data.resources, obj: sinkUriObj, eventSources: eventSourcesData },
        data: { ...data.data, sinkUri },
        resource: sinkUriObj,
      };
      knDataModel.nodes.push(
        ...getSinkUriTopologyNodeItems(NodeType.SinkUri, sinkTargetUid, sinkData),
      );
    }
    knDataModel.edges.push(...getSinkUriTopologyEdgeItems(resource, sinkTargetUid));
  }
  // form connections for channels
  if (!isInternalResource(resource)) {
    const channelResourceProps = getDynamicChannelModelRefs();
    channelResourceProps?.forEach((currentProp) => {
      resources[currentProp] &&
        knDataModel.edges.push(...getEventTopologyEdgeItems(resource, resources[currentProp]));
    });
  }
  knDataModel.edges.push(...getEventTopologyEdgeItems(resource, resources.brokers));
};

export const createEventSinkTopologyNodeData = (
  resource: K8sResourceKind,
  overviewItem: OverviewItem,
  type: string,
  operatorBackedService = false,
): TopologyDataObject => {
  const dcUID = get(resource, 'metadata.uid');
  return {
    id: dcUID,
    name: resource?.metadata.name,
    type,
    resource,
    resources: { ...overviewItem, isOperatorBackedService: operatorBackedService },
    data: {
      kind: getReferenceForResource(resource),
      isKnativeResource: type === NodeType.EventSink,
      kameletType: KameletType.Sink,
    },
  };
};

export const transformKnNodeData = (
  knResourcesData: K8sResourceKind[],
  type: string,
  resources: TopologyDataResources,
  utils?: KnativeUtil[],
): Model => {
  const knDataModel: Model = { nodes: [], edges: [] };
  knResourcesData?.forEach((res) => {
    const item = createKnativeDeploymentItems(res, resources, utils);
    switch (type) {
      case NodeType.KafkaSink:
      case NodeType.EventSink: {
        const data = createEventSinkTopologyNodeData(res, item, type);
        const itemData = getOwnedEventSinkData(res, data, resources);
        knDataModel.nodes.push(...getKnativeTopologyNodeItems(res, type, itemData, resources));
        knDataModel.edges.push(...getEventSinkTopologyEdgeItems(res, resources));
        const newGroup = getTopologyGroupItems(res);
        mergeGroup(newGroup, knDataModel.nodes);
        break;
      }
      case NodeType.EventSource: {
        const data = createTopologyNodeData(
          res,
          item,
          type,
          getImageForIconClass(`icon-openshift`),
        );
        if (
          getGroupVersionKindForResource(res) ===
          getGroupVersionKindForModel(CamelKameletBindingModel)
        ) {
          data.data = {
            ...data.data,
            kameletType: KameletType.Source,
          };
        }
        if (!(res.kind === EVENT_SOURCE_SINK_BINDING_KIND && res.metadata?.ownerReferences)) {
          const itemData = getOwnedEventSourceData(res, data, resources);
          knDataModel.nodes.push(...getKnativeTopologyNodeItems(res, type, itemData, resources));
          knDataModel.edges.push(
            ...(resources.ksservices ? getEventTopologyEdgeItems(res, resources.ksservices) : []),
            ...(resources.kafkasinks ? getEventTopologyEdgeItems(res, resources.kafkasinks) : []),
          );
          sinkURIDataModel(res, resources, data, knDataModel);
          const newGroup = getTopologyGroupItems(res);
          mergeGroup(newGroup, knDataModel.nodes);
        }
        break;
      }
      case NodeType.KnService: {
        const data = createTopologyServiceNodeData(res, item, type);
        knDataModel.nodes.push(...getKnativeTopologyNodeItems(res, type, data, resources));
        knDataModel.edges.push(...getTrafficTopologyEdgeItems(res, resources.revisions));
        const newGroup = getTopologyGroupItems(res);
        mergeGroup(newGroup, knDataModel.nodes);
        break;
      }
      case NodeType.PubSub: {
        if (!isInternalResource(res)) {
          const itemData = createPubSubDataItems(res, resources);
          const data = createTopologyPubSubNodeData(res, itemData, type);
          knDataModel.nodes.push(...getKnativeTopologyNodeItems(res, type, data, resources));
          if (res.kind === EventingBrokerModel.kind) {
            knDataModel.edges.push(...getTriggerTopologyEdgeItems(res, resources));
          } else {
            knDataModel.edges.push(...getSubscriptionTopologyEdgeItems(res, resources));
          }
          const newGroup = getTopologyGroupItems(res);
          mergeGroup(newGroup, knDataModel.nodes);
        }
        break;
      }
      case NodeType.EventSourceKafka: {
        const data = createTopologyNodeData(
          res,
          item,
          type,
          getImageForIconClass(`icon-openshift`),
        );
        knDataModel.nodes.push(...getKnativeTopologyNodeItems(res, type, data, resources));
        knDataModel.edges.push(
          ...getKnSourceKafkaTopologyEdgeItems(res, resources.kafkaConnections),
          ...getEventTopologyEdgeItems(res, resources.ksservices),
          ...getEventTopologyEdgeItems(res, resources.kafkasinks),
        );
        sinkURIDataModel(res, resources, data, knDataModel);
        const newGroup = getTopologyGroupItems(res);
        mergeGroup(newGroup, knDataModel.nodes);
        break;
      }
      default:
        break;
    }
  });

  return knDataModel;
};

export const getRevisionsData = (
  knResourcesData: K8sResourceKind[],
  resources: TopologyDataResources,
  utils?: KnativeUtil[],
): RevisionDataMap => {
  const revisionData = {};

  knResourcesData?.forEach((res) => {
    const { uid } = res.metadata;
    const item = createKnativeDeploymentItems(res, resources, utils);
    revisionData[uid] = createTopologyNodeData(
      res,
      item,
      NodeType.Revision,
      getImageForIconClass(`icon-openshift`),
    );
  });

  return revisionData;
};
