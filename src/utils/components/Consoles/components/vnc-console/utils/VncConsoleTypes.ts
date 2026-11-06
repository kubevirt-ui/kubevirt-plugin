import { Dispatch, MouseEventHandler, SetStateAction } from 'react';

import { ConsoleComponentState } from '../../utils/types';

import { SCAN_CODE_NAMES, VNC_LOG_LEVELS } from './constants';

export type VncConsoleActionsProps = {
  /** VNC console additional send keys elements */
  customButtons?: { onClick: () => void; text: string }[];
  onDisconnect: MouseEventHandler<HTMLButtonElement>;
  /** Injext text to VNC console from copied clipboard text */
  onInjectTextFromClipboard?: MouseEventHandler<HTMLButtonElement>;
};

export type CustomConnectComponentProps = {
  connect: () => void;
  isConnecting: boolean;
};

// noVNC provides no type definitions
// list properties used by our UI
export type RFB = {
  _rfbConnectionState: string;
  _sock: { on: (name: string, callback: (args: { code?: number }) => void) => void };
  _socketClose: () => void;
  _viewOnly: boolean;
  addEventListener: (name: string, callback: () => void) => void;
  disconnect: () => void;
  scaleViewport: boolean;
  sendCtrlAltDel: () => void;
  sendKey: (keysym: number, code: string, down: boolean) => void;
  viewOnly: boolean;
};

export type VncConsoleProps = {
  basePath: string;
  scaleViewport?: boolean;
  setState: Dispatch<SetStateAction<ConsoleComponentState>>;
  viewOnly?: boolean;
  vncLogLevel?: VncLogLevel;
};

export type RfbSession = {
  rfb: RFB;
  sessionID: number;
  testUrl?: string;
};

export type ScanCodeName = typeof SCAN_CODE_NAMES[number];
export type VncLogLevel = false | typeof VNC_LOG_LEVELS[number];
