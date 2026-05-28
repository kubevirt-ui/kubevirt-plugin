/** Segment event property values — use these instead of inline strings. */

export const TELEMETRY_HELP_ITEM_ID = {
  HELP_ICON: 'help-icon',
} as const;

export const TELEMETRY_TASK_TYPE = {
  VM_CREATION: 'vm_creation',
} as const;

export const TELEMETRY_TASK_ERROR_TYPE = {
  VM_CREATION_FAILED: 'vm_creation_failed',
} as const;

export const TELEMETRY_VM_CREATION_METHOD = {
  CLONE: 'clone',
  INSTANCE_TYPE: 'instancetype',
  SCRATCH: 'scratch',
  TEMPLATE: 'template',
} as const;

export const TELEMETRY_TEMPLATE_TYPE = {
  PREDEFINED: 'predefined',
  USER_DEFINED: 'user_defined',
} as const;

export const TELEMETRY_VM_ACTION = {
  CLONE: 'clone',
  DELETE: 'delete',
  MIGRATE: 'migrate',
  PAUSE: 'pause',
  RESET: 'reset',
  RESTART: 'restart',
  SNAPSHOT: 'snapshot',
  START: 'start',
  STOP: 'stop',
  UNPAUSE: 'unpause',
} as const;

export const TELEMETRY_CONSOLE_TYPE = {
  MULTI_CLUSTER_HUB: 'multi_cluster_hub',
  SINGLE_CLUSTER: 'single_cluster',
} as const;

export const TELEMETRY_CONSOLE_ACTION = {
  VIEW_VM_LIST: 'view_vm_list',
} as const;

export const TELEMETRY_TREE_VIEW_ACTION = {
  FILTER: 'filter',
  NAVIGATE: 'navigate',
  SELECT_VM: 'select_vm',
  SORT: 'sort',
} as const;

export const TELEMETRY_RESOURCE_TYPE = {
  DATAVOLUME: 'datavolume',
  NAD: 'nad',
  NNCP: 'nncp',
  ROUTE: 'route',
  SERVICE: 'service',
  TEMPLATE: 'template',
  UDN: 'udn',
  VM: 'vm',
} as const;

export const TELEMETRY_RESOURCE_CREATION_METHOD = {
  FORM: 'form',
  YAML: 'yaml',
} as const;

export const TELEMETRY_EDITOR_VIEW_SWITCH = {
  FORM_TO_YAML: 'form_to_yaml',
  YAML_TO_FORM: 'yaml_to_form',
} as const;

export const TELEMETRY_VM_DETAIL_TAB = {
  CONFIGURATION: 'configuration',
  CONSOLE: 'console',
  DIAGNOSTIC: 'diagnostic',
  DISKS: 'disks',
  EVENTS: 'events',
  METRICS: 'metrics',
  NETWORK: 'network',
  OVERVIEW: 'overview',
  SNAPSHOTS: 'snapshots',
  YAML: 'yaml',
} as const;

export const TELEMETRY_VM_ERROR_TYPE = {
  CRASHLOOP: 'crashloop',
  IMAGE_PULL_FAILED: 'image_pull_failed',
  OTHER: 'other',
  PROVISIONING_STUCK: 'provisioning_stuck',
  UNSCHEDULABLE: 'unschedulable',
} as const;

export const TELEMETRY_ERROR_RESOLUTION_ACTION = {
  CONSULT_DOCS: 'consult_docs',
  DELETE_RECREATE: 'delete_recreate',
  EDIT_CONFIG: 'edit_config',
  ESCALATE_SUPPORT: 'escalate_support',
  RESTART: 'restart',
} as const;

export const TELEMETRY_STATUS = {
  FAILURE: 'failure',
  SUCCESS: 'success',
} as const;

export const TELEMETRY_HOTPLUG_OPERATION = {
  ADD: 'add',
  REMOVE: 'remove',
} as const;

export const TELEMETRY_VM_STATE = {
  RUNNING: 'running',
} as const;

export const TELEMETRY_DISK_TYPE = {
  CONTAINER_DISK: 'containerDisk',
  DATA_VOLUME: 'dataVolume',
  EPHEMERAL: 'ephemeral',
  OTHER: 'other',
  PERSISTENT_VOLUME_CLAIM: 'persistentVolumeClaim',
} as const;

export const TELEMETRY_SOURCE_PROVIDER = {
  OPENSTACK: 'openstack',
  OTHER: 'other',
  OVIRT: 'ovirt',
  RHV: 'rhv',
  VSPHERE: 'vsphere',
} as const;

export const MTV_PROVIDER_TYPE = {
  OPENSTACK: TELEMETRY_SOURCE_PROVIDER.OPENSTACK,
  OVIRT: TELEMETRY_SOURCE_PROVIDER.OVIRT,
  REDHAT: 'redhat',
  RHV: TELEMETRY_SOURCE_PROVIDER.RHV,
  VMWARE: 'vmware',
  VSPHERE: TELEMETRY_SOURCE_PROVIDER.VSPHERE,
} as const;

export const TELEMETRY_ALERT_SEVERITY = {
  CRITICAL: 'critical',
  INFO: 'info',
  WARNING: 'warning',
} as const;

export const TELEMETRY_ALERT_ACTION = {
  DISMISS: 'dismiss',
  IGNORE: 'ignore',
  INVESTIGATE: 'investigate',
  SILENCE: 'silence',
} as const;

export const TELEMETRY_CONSOLE_SESSION_TYPE = {
  RDP: 'rdp',
  SERIAL: 'serial',
  VNC: 'vnc',
} as const;

export const TELEMETRY_WORKLOAD_TYPE = {
  DESKTOP: 'desktop',
  HIGH_PERFORMANCE: 'highperformance',
  SERVER: 'server',
} as const;

export const TELEMETRY_OS_FAMILY = {
  LINUX: 'linux',
  OTHER: 'other',
  WINDOWS: 'windows',
} as const;

export const TELEMETRY_EXTERNAL_MONITORING_TOOL = {
  GRAFANA: 'grafana',
  OTHER: 'other',
  PROMETHEUS: 'prometheus',
} as const;

export const TELEMETRY_GPU_PASSTHROUGH_TYPE = {
  GPU: 'gpu',
  VGPU: 'vgpu',
} as const;

export const TELEMETRY_PROJECT_MAPPING_METHOD = {
  ALL_PROJECTS: 'all_projects',
  LABEL_SELECTOR: 'label_selector',
  SELECT_FROM_LIST: 'select_from_list',
} as const;

export const TELEMETRY_PROFICIENCY_MILESTONE = {
  CONSISTENT_SUCCESS: 'consistent_success',
  FIRST_SUCCESS: 'first_success',
} as const;

export const TELEMETRY_PROFICIENCY_LEVEL = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  PROFICIENT: 'proficient',
} as const;

export const TELEMETRY_SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export const TELEMETRY_UNKNOWN_ERROR_MESSAGE = 'Unknown error';
