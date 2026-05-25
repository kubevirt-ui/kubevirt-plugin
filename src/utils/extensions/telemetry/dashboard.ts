import {
  EXTERNAL_MONITORING_NAVIGATION,
  VM_CONSOLE_OPENED,
  VM_DETAIL_TAB_VIEWED,
  VM_LIST_FILTERED,
  VM_LIST_SEARCHED,
} from './utils/constants';
import {
  TELEMETRY_EXTERNAL_MONITORING_TOOL,
  TELEMETRY_SORT_ORDER,
} from './utils/property-constants';
import { ConsoleSessionTypeTelemetry, VMDetailTabTelemetry } from './utils/types';
import { eventMonitor } from './telemetry';

export const logVMDetailTabViewed = (tabName: VMDetailTabTelemetry, vmName?: string) => {
  eventMonitor(VM_DETAIL_TAB_VIEWED, { tabName, ...(vmName && { vmName }) });
};

export const logVMListFiltered = (properties: {
  filterType?: string;
  sortField?: string;
  sortOrder?: (typeof TELEMETRY_SORT_ORDER)[keyof typeof TELEMETRY_SORT_ORDER];
}) => {
  eventMonitor(VM_LIST_FILTERED, properties);
};

export const logVMListSearched = (searchTerm: string, resultCount: number) => {
  eventMonitor(VM_LIST_SEARCHED, { resultCount, searchTerm });
};

export const logExternalMonitoringNavigation = (
  targetTool: (typeof TELEMETRY_EXTERNAL_MONITORING_TOOL)[keyof typeof TELEMETRY_EXTERNAL_MONITORING_TOOL],
  sourceTab?: string,
) => {
  eventMonitor(EXTERNAL_MONITORING_NAVIGATION, { sourceTab, targetTool });
};

export const logVMConsoleOpened = (consoleType: ConsoleSessionTypeTelemetry) => {
  eventMonitor(VM_CONSOLE_OPENED, { consoleType });
};
