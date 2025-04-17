import { FC, HTMLProps, MouseEventHandler } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';
import { RFBCreate } from '@novnc/novnc/lib/rfb';
import { Fleet } from '@stolostron/multicluster-sdk';

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
  vmi: Fleet<V1VirtualMachineInstance>;
};
