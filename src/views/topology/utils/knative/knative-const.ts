import { DEFAULT_GROUP_PAD, GROUP_WIDTH } from '../../const';

// Flags
export const FLAG_KNATIVE_EVENTING = 'KNATIVE_EVENTING';

export const TYPE_EVENT_SOURCE = 'event-source';
export const TYPE_EVENT_SINK = 'event-sink';
export const TYPE_KAFKA_SINK = 'kafka-sink';
export const TYPE_EVENT_SOURCE_KAFKA = 'event-source-kafka';
export const TYPE_EVENT_SOURCE_LINK = 'event-source-link';
export const TYPE_EVENT_SINK_LINK = 'event-sink-link';
export const TYPE_KAFKA_CONNECTION_LINK = 'event-source-kafka-link';
export const TYPE_EVENT_PUB_SUB = 'event-pubsub';
export const TYPE_EVENT_PUB_SUB_LINK = 'event-pubsub-link';
export const TYPE_KNATIVE_SERVICE = 'knative-service';
export const TYPE_REVISION_TRAFFIC = 'revision-traffic';
export const TYPE_KNATIVE_REVISION = 'knative-revision';
export const TYPE_SINK_URI = 'sink-uri';
export const TYPE_MANAGED_KAFKA_CONNECTION = 'KafkaConnection';

export const KNATIVE_GROUP_NODE_WIDTH = GROUP_WIDTH;
export const KNATIVE_GROUP_NODE_HEIGHT = 100;
export const KNATIVE_GROUP_NODE_PADDING = [
  DEFAULT_GROUP_PAD,
  DEFAULT_GROUP_PAD,
  DEFAULT_GROUP_PAD + 10,
  DEFAULT_GROUP_PAD,
];

export const EVENT_MARKER_RADIUS = 6;

// URI Kind
export const URI_KIND = 'URI';

export const KNATIVE_SERVING_APIGROUP = 'serving.knative.dev';
export const ALL_IMPORT_RESOURCE_ACCESS = 'allImportResourceAccess';
export const ALL_CATALOG_IMAGE_RESOURCE_ACCESS = 'allCatalogImageResourceAccess';
export const SERVICE_BINDING_ENABLED = 'SERVICE_BINDING_ENABLED';
export const CAMEL_APIGROUP = 'camel.apache.org';
export const CAMEL_SOURCE_INTEGRATION = `${CAMEL_APIGROUP}/integration`;
export const EVENT_SOURCE_SINK_BINDING_KIND = 'SinkBinding';
export const EVENT_SOURCE_KAFKA_KIND = 'KafkaSource';
export const EVENT_SOURCE_CAMEL_KIND = 'CamelSource';
export const EVENT_SOURCE_API_SERVER_KIND = 'ApiServerSource';
export const EVENT_SOURCE_CONTAINER_KIND = 'ContainerSource';
export const EVENT_SOURCE_PING_KIND = 'PingSource';
export const KNATIVE_EVENT_SOURCE_APIGROUP = 'sources.knative.dev';
export const KNATIVE_EVENT_MESSAGE_APIGROUP = 'messaging.knative.dev';
export const STRIMZI_KAFKA_APIGROUP = 'kafka.strimzi.io';
export const KNATIVE_EVENTING_APIGROUP = 'eventing.knative.dev';
export const SERVERLESS_FUNCTION_LABEL_DEPRECATED = 'boson.dev/function'; // TODO: remove deprecated label for serverless function
export const SERVERLESS_FUNCTION_LABEL = 'function.knative.dev';

export const KNATIVE_SERVING_LABEL = 'serving.knative.dev/service';
