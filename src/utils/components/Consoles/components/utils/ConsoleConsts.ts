import { type WSFactory } from '@openshift-console/dynamic-plugin-sdk/lib/utils/k8s/ws-factory';

import { type ConsoleType } from './types';

export enum ConsoleState {
  Connected = 'connected',
  Connecting = 'connecting',
  Destroyed = 'destroyed',
  Disconnected = 'disconnected',
  Disconnecting = 'disconnecting',
  Init = 'init',
  Loading = 'loading',
  Open = 'open',
  SessionAlreadyInUse = 'session_already_in_use',
}

export const WS_PROTOCOL = 'ws';
export const WSS = 'wss';
export const HTTP = 'http';
export const HTTPS = 'https';
export const SERIAL_CONSOLE_TYPE = 'Serial console';
export const VNC_CONSOLE_TYPE = 'VNC console';
export const DESKTOP_VIEWER_CONSOLE_TYPE = 'Desktop viewer';
export const SPICE_CONSOLE_TYPE = 'SpiceConsole';
export const RDP_CONSOLE_TYPE = 'RdpConsole';

export const ConsoleTypes = [
  VNC_CONSOLE_TYPE,
  SERIAL_CONSOLE_TYPE,
  DESKTOP_VIEWER_CONSOLE_TYPE,
] as const;

export const isConsoleType = (value: unknown): value is ConsoleType =>
  // eslint-disable-next-line unicorn/prefer-includes -- .includes() on narrow tuple types requires a cast
  typeof value === 'string' && ConsoleTypes.some((type) => type === value);

export type WSFactoryExtends = {
  onPaste: () => void;
} & WSFactory;
