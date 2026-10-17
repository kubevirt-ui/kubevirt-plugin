import type { ReactNode } from 'react';

const noop = (): void => undefined;

const componentStub = (): null => null;

const fnStub = (): typeof componentStub => componentStub;

const proxyTarget: Record<string, unknown> = {};

const consoleHostStub: Record<string, unknown> = new Proxy(proxyTarget, {
  get: (_target, prop: string) => {
    if (prop === '__esModule') {
      return true;
    }
    if (prop === 'default') {
      return consoleHostStub;
    }
    return fnStub;
  },
});

export default consoleHostStub;

export const useResolvedExtensions = (): [Map<unknown, unknown>, boolean] => [new Map(), true];

export const useUtilizationDuration = (): Record<string, unknown> => ({});

export const useDashboardResources = (): Record<string, unknown> => ({});

export const ActivityItem = componentStub;

export const ActivityBody = componentStub;

export const AlertsBody = componentStub;

export const AlertItem = componentStub;

export const HealthItem = componentStub;

export const HealthBody = componentStub;

export const InventoryItem = componentStub;

export const UtilizationItem = componentStub;

export const UtilizationBody = componentStub;

export const UtilizationDurationDropdown = componentStub;

export const VirtualizedGrid = componentStub;

export const LazyActionMenu = componentStub;

export const QuickStartsLoader = componentStub;

export const HorizontalNav = componentStub;

export const VirtualizedTable = componentStub;

export const useActiveColumns = (): unknown[] => [];

export const useToast = (): { fireToast: typeof noop } => ({ fireToast: noop });

export const checkAccess = async (): Promise<boolean> => true;

export const ActionServiceProvider = ({ children }: { children?: ReactNode }): ReactNode =>
  children;

export const ActionService = componentStub;

export const ResourceYAMLEditor = componentStub;

export const TableData = componentStub;

export const ResourceLink = componentStub;

export const PodRingSet = componentStub;

export const WorkloadNode = componentStub;

export const CreateConnector = componentStub;

export const OdcBaseNode = componentStub;

export const getSegmentAnalytics = (): undefined => undefined;

export const useLastNamespace = (): [string, (ns: string) => void] => ['default', noop];

export const useURLPoll = (): unknown[] => [undefined, true, null];

export const useGetModifyApplicationAction = (): undefined => undefined;

export const BaseNode = componentStub;
