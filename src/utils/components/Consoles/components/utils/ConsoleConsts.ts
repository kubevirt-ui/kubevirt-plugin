import { WSFactory } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/ws-factory';

export enum ConsoleState {
  'connected' = 'connected',
  'connecting' = 'connecting',
  'destroyed' = 'destroyed',
  'disconnected' = 'disconnected',
  'disconnecting' = 'disconnecting',
  'init' = 'init',
  'loading' = 'loading',
  'open' = 'open',
}

export const WS = 'ws';
export const WSS = 'wss';
export const SERIAL_CONSOLE_TYPE = 'Serial console';
export const VNC_CONSOLE_TYPE = 'VNC console';
export const DESKTOP_VIEWER_CONSOLE_TYPE = 'Desktop viewer';
export const SPICE_CONSOLE_TYPE = 'SpiceConsole';
export const RDP_CONSOLE_TYPE = 'RdpConsole';

export interface WSFactoryExtends extends WSFactory {
  onPaste: () => void;
}
