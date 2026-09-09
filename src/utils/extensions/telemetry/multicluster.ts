import { eventMonitor } from './telemetry';
import {
  CONSOLE_USED,
  MULTI_CLUSTER_MANAGEMENT_DETECTED,
  TREE_VIEW_ACTION,
} from './utils/constants';
import { type TELEMETRY_CONSOLE_ACTION } from './utils/property-constants';
import { type ConsoleTypeTelemetry, type TreeViewActionTelemetry } from './utils/types';

export type ConsoleActionTelemetry =
  (typeof TELEMETRY_CONSOLE_ACTION)[keyof typeof TELEMETRY_CONSOLE_ACTION];

export const logMultiClusterManagementDetected = (
  acmInstalled: boolean,
  managedClusterCount?: number,
): void => {
  eventMonitor(MULTI_CLUSTER_MANAGEMENT_DETECTED, { acmInstalled, managedClusterCount });
};

export const logConsoleUsed = (
  consoleType: ConsoleTypeTelemetry,
  action: ConsoleActionTelemetry,
): void => {
  eventMonitor(CONSOLE_USED, { action, consoleType });
};

export const logTreeViewAction = (action: TreeViewActionTelemetry, clusterCount?: number): void => {
  eventMonitor(TREE_VIEW_ACTION, { action, clusterCount });
};
