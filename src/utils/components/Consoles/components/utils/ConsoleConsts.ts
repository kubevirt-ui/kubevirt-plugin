export enum ConsoleState {
  'connected' = 'connected',
  'connecting' = 'connecting',
  'disconnected' = 'disconnected',
  'disconnecting' = 'disconnecting',
  'loading' = 'loading',
}

export const WS = 'ws';
export const WSS = 'wss';
export const SERIAL_CONSOLE_TYPE = 'Serial console';
export const VNC_CONSOLE_TYPE = 'VNC console';
export const DESKTOP_VIEWER_CONSOLE_TYPE = 'Desktop viewer';
export const SPICE_CONSOLE_TYPE = 'SpiceConsole';
export const RDP_CONSOLE_TYPE = 'RdpConsole';
