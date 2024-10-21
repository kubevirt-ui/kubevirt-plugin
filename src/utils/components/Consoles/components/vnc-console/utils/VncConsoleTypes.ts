import { FC, HTMLProps, MouseEventHandler, ReactNode } from 'react';

import { V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';

export type VncConsoleActionsProps = {
  /** VNC console additional send keys elements */
  customButtons?: { onClick: () => void; text: string }[];
  onDisconnect: MouseEventHandler<HTMLButtonElement>;
  /** Injext text to VNC console from copied clipboard text */
  onInjectTextFromClipboard?: MouseEventHandler<HTMLButtonElement>;
};

export type VncConsoleProps = HTMLProps<HTMLDivElement> & {
  /** A custom component to replace th default connect button screen */
  CustomConnectComponent?: FC<{ connect: () => void }>;
  /** A custom component to replace th default disabled component */
  CustomDisabledComponent?: ReactNode;
  /** Should console render alt tabs */
  hasGPU?: boolean;
  scaleViewport?: boolean;
  showAccessControls?: boolean;
  viewOnly?: boolean;
  vmi: V1VirtualMachineInstance;
};
