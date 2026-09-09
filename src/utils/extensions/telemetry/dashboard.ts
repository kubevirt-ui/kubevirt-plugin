import { type KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

import { eventMonitor } from './telemetry';
import {
  EXTERNAL_MONITORING_NAVIGATION,
  VM_ADVANCED_SEARCH_MODAL_USED,
  VM_CONSOLE_OPENED,
  VM_DETAIL_TAB_VIEWED,
  VM_LIST_FILTERED,
  VM_SAVED_SEARCH_APPLIED,
  VM_SEARCH_LANGUAGE_USED,
} from './utils/constants';
import {
  type TELEMETRY_EXTERNAL_MONITORING_TOOL,
  type TELEMETRY_SORT_ORDER,
} from './utils/property-constants';
import { type ConsoleSessionTypeTelemetry, type VMDetailTabTelemetry } from './utils/types';

export const logVMDetailTabViewed = (tabName: VMDetailTabTelemetry, vmName?: string): void => {
  eventMonitor(VM_DETAIL_TAB_VIEWED, { tabName, ...(vmName && { vmName }) });
};

export const logVMListFiltered = (properties: {
  filterType?: string;
  sortField?: string;
  sortOrder?: (typeof TELEMETRY_SORT_ORDER)[keyof typeof TELEMETRY_SORT_ORDER];
}): void => {
  eventMonitor(VM_LIST_FILTERED, properties);
};

export const logVMAdvancedSearchModalUsed = (filters: Partial<KubevirtFilterState>): void => {
  eventMonitor(VM_ADVANCED_SEARCH_MODAL_USED, filters);
};

export const logVMSearchLanguageUsed = (filters: Partial<KubevirtFilterState>): void => {
  eventMonitor(VM_SEARCH_LANGUAGE_USED, filters);
};

export const logVMSavedSearchApplied = (searchQuery: string): void => {
  eventMonitor(VM_SAVED_SEARCH_APPLIED, { searchQuery });
};

export const logExternalMonitoringNavigation = (
  targetTool: (typeof TELEMETRY_EXTERNAL_MONITORING_TOOL)[keyof typeof TELEMETRY_EXTERNAL_MONITORING_TOOL],
  sourceTab?: string,
): void => {
  eventMonitor(EXTERNAL_MONITORING_NAVIGATION, { sourceTab, targetTool });
};

export const logVMConsoleOpened = (consoleType: ConsoleSessionTypeTelemetry): void => {
  eventMonitor(VM_CONSOLE_OPENED, { consoleType });
};
