import { KubevirtFilterState } from '@kubevirt-utils/hooks/useKubevirtDataViewFilters/types';

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

export const logVMAdvancedSearchModalUsed = (filters: Partial<KubevirtFilterState>) => {
  eventMonitor(VM_ADVANCED_SEARCH_MODAL_USED, filters);
};

export const logVMSearchLanguageUsed = (filters: Partial<KubevirtFilterState>) => {
  eventMonitor(VM_SEARCH_LANGUAGE_USED, filters);
};

export const logVMSavedSearchApplied = (searchQuery: string) => {
  eventMonitor(VM_SAVED_SEARCH_APPLIED, { searchQuery });
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
