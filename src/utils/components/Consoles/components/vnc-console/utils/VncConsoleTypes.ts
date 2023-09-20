import { FC, HTMLProps, MouseEventHandler, ReactNode } from 'react';

export type VncConsoleActionsProps = {
  /** VNC console additional action elements */
  additionalButtons?: ReactNode[];
  /** VNC console additional send keys elements */
  customButtons?: { onClick: () => void; text: string }[];
  onDisconnect: MouseEventHandler<HTMLButtonElement>;
  /** Injext text to VNC console from copied clipboard text */
  onInjectTextFromClipboard?: MouseEventHandler<HTMLButtonElement>;
  textDisconnect?: string;
  textSendShortcut?: string;
};

export type VncConsoleProps = HTMLProps<HTMLDivElement> & {
  additionalButtons?: ReactNode[];

  /** Should console try to connect once rendering */
  autoConnect?: boolean;
  /** Children nodes */
  children?: ReactNode;
  consoleContainerId?: string;
  /** An Object specifying the credentials to provide to the server when authenticating
   * { username: '' password: '' target: ''}
   */
  credentials?: object;
  /** A custom component to replace th default connect button screen */
  CustomConnectComponent?: FC<{ connect: () => void }>;
  /** A custom component to replace th default disabled component */
  CustomDisabledComponent?: ReactNode;
  encrypt?: boolean;
  /** Should console render alt tabs */
  hasGPU?: boolean;
  /** FQDN or IP to connect to */
  host: string;
  /** Callback. VNC server disconnected. */
  onDisconnected?: (e: any) => void;
  /** Initialization of RFB failed */
  onInitFailed?: (e: any) => void;
  /** Handshake failed */
  onSecurityFailure?: (e: any) => void;
  /** host:port/path */
  path?: string;
  /** TCP Port */
  port?: string;

  /** A DOMString specifying the ID to provide to any VNC repeater encountered */
  repeaterID?: string;
  /** Is a boolean indicating if a request to resize the remote session should be sent whenever the container changes dimensions */
  resizeSession?: boolean;
  /** Is a boolean indicating if the remote session should be scaled locally so it fits its container */
  scaleViewport?: boolean;

  /** Is a boolean indicating if the remote server should be shared or if any other connected clients should be disconnected */
  shared?: boolean;
  /** Is a boolean to indicate if to show the access controls */
  showAccessControls?: boolean;
  /* Text content rendered inside the EmptyState in the "Connect' button for when console is disconnnected */
  textConnect?: string;
  /* Text content rendered inside the EmptyState for when console is connecting */
  textConnecting?: ReactNode | string;
  /** Text content rendered inside the Ctrl-Alt-Delete dropdown entry */
  textCtrlAltDel?: string;
  /** Text content rendered inside the Disconnect button */
  textDisconnect?: string;
  /* Text content rendered inside the EmptyState for when console is disconnnected */
  textDisconnected?: string;
  /** Text content rendered inside the button Send shortcut dropdown toggle */
  textSendShortcut?: string;
  /** Is a boolean indicating if any events (e.g. key presses or mouse movement) should be prevented from being sent to the server */
  viewOnly?: boolean;
  /** log-level for noVNC */
  vncLogging?: 'debug' | 'error' | 'info' | 'none' | 'warn';
};
