import { FC, HTMLProps, MouseEventHandler } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { RFBCreate } from '@novnc/novnc/lib/rfb';

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

export type VncConsoleProps = HTMLProps<HTMLDivElement> & {
  /** A custom component to replace th default connect button screen */
  CustomConnectComponent?: FC<CustomConnectComponentProps>;
  /** Should console render alt tabs */
  hasGPU?: boolean;
  onConnect?: (rfb: RFBCreate) => void;
  scaleViewport?: boolean;
  viewOnly?: boolean;
  vmi: V1VirtualMachineInstance;
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
