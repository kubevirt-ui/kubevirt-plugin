// Prefix our localStorage items to avoid conflicts if another app ever runs on the same domain.
export const STORAGE_PREFIX = 'bridge';
export const USERSETTINGS_PREFIX = 'console';

export const TOAST_TIMEOUT_LONG = 20000;
export const TOAST_TIMEOUT_DEFAULT = true;

export const TYPE_EVENT_SOURCE_LINK = 'event-source-link';
export const TYPE_KAFKA_CONNECTION_LINK = 'event-source-kafka-link';
export const URI_KIND = 'URI';

export const ALLOW_SERVICE_BINDING_FLAG = 'ALLOW_SERVICE_BINDING';
export const INCONTEXT_ACTIONS_SERVICE_BINDING = 'serviceBinding';

export const TYPE_WORKLOAD = 'workload';
export const TYPE_CONNECTS_TO = 'connects-to';
export const TYPE_AGGREGATE_EDGE = 'aggregate-edge';
export const TYPE_SERVICE_BINDING = 'service-binding';
export const TYPE_APPLICATION_GROUP = 'part-of';
export const TYPE_TRAFFIC_CONNECTOR = 'traffic-connector';
export const LAST_TOPOLOGY_VIEW_LOCAL_STORAGE_KEY = `${STORAGE_PREFIX}/last-topology-view`;
export const TOPOLOGY_LAYOUT_LOCAL_STORAGE_KEY = `${STORAGE_PREFIX}/topology-layout`;
export const LAST_TOPOLOGY_OVERVIEW_OPEN_STORAGE_KEY = `${STORAGE_PREFIX}/last-topology-overview-open`;

const STORAGE_TOPOLOGY = 'topology';
const CONFIG_STORAGE_DEVCONSOLE = 'devconsole';

export const TOPOLOGY_VIEW_CONFIG_STORAGE_KEY = `${CONFIG_STORAGE_DEVCONSOLE}.${STORAGE_TOPOLOGY}.lastView`;
export const TOPOLOGY_LAYOUT_CONFIG_STORAGE_KEY = `${CONFIG_STORAGE_DEVCONSOLE}.${STORAGE_TOPOLOGY}.layout`;
export const TOPOLOGY_SIDE_BAR_WIDTH_STORAGE_KEY = `${CONFIG_STORAGE_DEVCONSOLE}.${STORAGE_TOPOLOGY}.sideBarSize`;

export const DEFAULT_NODE_PAD = 20;
export const DEFAULT_GROUP_PAD = 40;

export const NODE_WIDTH = 104;
export const NODE_HEIGHT = 104;
export const NODE_PADDING = [0, DEFAULT_NODE_PAD];

export const GROUP_WIDTH = 300;
export const GROUP_HEIGHT = 180;
export const GROUP_PADDING = [
  DEFAULT_GROUP_PAD,
  DEFAULT_GROUP_PAD,
  DEFAULT_GROUP_PAD + 20,
  DEFAULT_GROUP_PAD,
];

export const CREATE_APPLICATION_KEY = '#CREATE_APPLICATION_KEY#';
export const UNASSIGNED_KEY = '#UNASSIGNED_APP#';

export const ALLOW_EXPORT_APP = 'ALLOW_EXPORT_APP';
export const EXPORT_CR_NAME = 'primer';
export const EXPORT_JOB_PREFIX = 'primer-export-';

export const ROUTE_URL_ANNOTATION = 'app.openshift.io/route-url';
export const ROUTE_DISABLED_ANNOTATION = 'app.openshift.io/route-disabled';

// Annotation key for deployment revision
export const DEPLOYMENT_REVISION_ANNOTATION = 'deployment.kubernetes.io/revision';

// List of container status waiting reason values that we should call out as errors in project status rows.
export const containerWaitingStateErrorReasons = [
  'CrashLoopBackOff',
  'ErrImagePull',
  'ImagePullBackOff',
];

// Annotation key for deployment phase
export const DEPLOYMENT_PHASE_ANNOTATION = 'openshift.io/deployment.phase';

// Annotation key for deployment config latest version
export const DEPLOYMENT_CONFIG_LATEST_VERSION_ANNOTATION =
  'openshift.io/deployment-config.latest-version';

// **** Helm constants ****
export const TYPE_HELM_RELEASE = 'helm-release';

export const RESOURCE_NAME_TRUNCATE_LENGTH = 13;
