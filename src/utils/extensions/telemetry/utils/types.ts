import {
  TELEMETRY_ALERT_ACTION,
  TELEMETRY_CONSOLE_SESSION_TYPE,
  TELEMETRY_CONSOLE_TYPE,
  TELEMETRY_EDITOR_VIEW_SWITCH,
  TELEMETRY_ERROR_RESOLUTION_ACTION,
  TELEMETRY_GPU_PASSTHROUGH_TYPE,
  TELEMETRY_HOTPLUG_OPERATION,
  TELEMETRY_OS_FAMILY,
  TELEMETRY_RESOURCE_CREATION_METHOD,
  TELEMETRY_RESOURCE_TYPE,
  TELEMETRY_SOURCE_PROVIDER,
  TELEMETRY_STATUS,
  TELEMETRY_TEMPLATE_TYPE,
  TELEMETRY_TREE_VIEW_ACTION,
  TELEMETRY_VM_ACTION,
  TELEMETRY_VM_CREATION_METHOD,
  TELEMETRY_VM_DETAIL_TAB,
  TELEMETRY_VM_ERROR_TYPE,
  TELEMETRY_WORKLOAD_TYPE,
} from './property-constants';

export type VMCreationMethodTelemetry =
  (typeof TELEMETRY_VM_CREATION_METHOD)[keyof typeof TELEMETRY_VM_CREATION_METHOD];

export type TemplateTypeTelemetry =
  (typeof TELEMETRY_TEMPLATE_TYPE)[keyof typeof TELEMETRY_TEMPLATE_TYPE];

export type VMActionTelemetry = (typeof TELEMETRY_VM_ACTION)[keyof typeof TELEMETRY_VM_ACTION];

export type ConsoleTypeTelemetry =
  (typeof TELEMETRY_CONSOLE_TYPE)[keyof typeof TELEMETRY_CONSOLE_TYPE];

export type TreeViewActionTelemetry =
  (typeof TELEMETRY_TREE_VIEW_ACTION)[keyof typeof TELEMETRY_TREE_VIEW_ACTION];

export type ResourceTypeTelemetry =
  (typeof TELEMETRY_RESOURCE_TYPE)[keyof typeof TELEMETRY_RESOURCE_TYPE];

export type ResourceCreationMethodTelemetry =
  (typeof TELEMETRY_RESOURCE_CREATION_METHOD)[keyof typeof TELEMETRY_RESOURCE_CREATION_METHOD];

export type EditorViewSwitchTelemetry =
  (typeof TELEMETRY_EDITOR_VIEW_SWITCH)[keyof typeof TELEMETRY_EDITOR_VIEW_SWITCH];

export type VMDetailTabTelemetry =
  (typeof TELEMETRY_VM_DETAIL_TAB)[keyof typeof TELEMETRY_VM_DETAIL_TAB];

export type VMErrorTypeTelemetry =
  (typeof TELEMETRY_VM_ERROR_TYPE)[keyof typeof TELEMETRY_VM_ERROR_TYPE];

export type ErrorResolutionActionTelemetry =
  (typeof TELEMETRY_ERROR_RESOLUTION_ACTION)[keyof typeof TELEMETRY_ERROR_RESOLUTION_ACTION];

export type MigrationStatusTelemetry = (typeof TELEMETRY_STATUS)[keyof typeof TELEMETRY_STATUS];

export type SnapshotStatusTelemetry = (typeof TELEMETRY_STATUS)[keyof typeof TELEMETRY_STATUS];

export type HotplugOperationTelemetry =
  (typeof TELEMETRY_HOTPLUG_OPERATION)[keyof typeof TELEMETRY_HOTPLUG_OPERATION];

export type SourceProviderTelemetry =
  (typeof TELEMETRY_SOURCE_PROVIDER)[keyof typeof TELEMETRY_SOURCE_PROVIDER];

export type AlertActionTelemetry =
  (typeof TELEMETRY_ALERT_ACTION)[keyof typeof TELEMETRY_ALERT_ACTION];

export type ConsoleSessionTypeTelemetry =
  (typeof TELEMETRY_CONSOLE_SESSION_TYPE)[keyof typeof TELEMETRY_CONSOLE_SESSION_TYPE];

export type WorkloadTypeTelemetry =
  (typeof TELEMETRY_WORKLOAD_TYPE)[keyof typeof TELEMETRY_WORKLOAD_TYPE];

export type OSFamilyTelemetry = (typeof TELEMETRY_OS_FAMILY)[keyof typeof TELEMETRY_OS_FAMILY];

export type GpuPassthroughTypeTelemetry =
  (typeof TELEMETRY_GPU_PASSTHROUGH_TYPE)[keyof typeof TELEMETRY_GPU_PASSTHROUGH_TYPE];
