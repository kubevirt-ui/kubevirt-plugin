import { type VncLogLevel } from './components/vnc-console/utils/VncConsoleTypes';

export type ConsolesProps = {
  consoleContainerClass?: string;
  isHeadlessMode: boolean;
  isStandAlone?: boolean;
  isVmRunning?: boolean;
  isWindowsVM: boolean;
  path: string;
  vmCluster?: string;
  vmName: string;
  vmNamespace: string;
  vncLogLevel?: VncLogLevel;
};
