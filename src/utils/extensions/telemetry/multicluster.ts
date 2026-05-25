import {
  CONSOLE_USED,
  MULTI_CLUSTER_MANAGEMENT_DETECTED,
  TREE_VIEW_ACTION,
} from './utils/constants';
import { TELEMETRY_CONSOLE_ACTION } from './utils/property-constants';
import { ConsoleTypeTelemetry, TreeViewActionTelemetry } from './utils/types';
import { eventMonitor } from './telemetry';

export type ConsoleActionTelemetry =
  (typeof TELEMETRY_CONSOLE_ACTION)[keyof typeof TELEMETRY_CONSOLE_ACTION];

export const logMultiClusterManagementDetected = (
  acmInstalled: boolean,
  managedClusterCount?: number,
) => {
  eventMonitor(MULTI_CLUSTER_MANAGEMENT_DETECTED, { acmInstalled, managedClusterCount });
};

export const logConsoleUsed = (
  consoleType: ConsoleTypeTelemetry,
  action: ConsoleActionTelemetry,
) => {
  eventMonitor(CONSOLE_USED, { action, consoleType });
};

export const logTreeViewAction = (action: TreeViewActionTelemetry, clusterCount?: number) => {
  eventMonitor(TREE_VIEW_ACTION, { action, clusterCount });
};
