export type VncConsoleActionsProps = {
  onDisconnect: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  textSendShortcut?: string;
  textDisconnect?: string;
  /** VNC console additional action elements */
  additionalButtons?: React.ReactNode[];
  /** VNC console additional send keys elements */
  customButtons?: { text: string; onClick: () => void }[];
};

export type VncConsoleProps = React.HTMLProps<HTMLDivElement> & {
  /** Children nodes */
  children?: React.ReactNode;

  /** FQDN or IP to connect to */
  host: string;
  /** TCP Port */
  port?: string;
  /** host:port/path */
  path?: string;
  encrypt?: boolean;
  /** Is a boolean indicating if a request to resize the remote session should be sent whenever the container changes dimensions */
  resizeSession?: boolean;
  /** Is a boolean indicating if the remote session should be scaled locally so it fits its container */
  scaleViewport?: boolean;
  /** Is a boolean indicating if any events (e.g. key presses or mouse movement) should be prevented from being sent to the server */
  viewOnly?: boolean;
  /** Is a boolean indicating if the remote server should be shared or if any other connected clients should be disconnected */
  shared?: boolean;
  /** An Object specifying the credentials to provide to the server when authenticating
   * { username: '' password: '' target: ''}
   */
  credentials?: object;
  /** A DOMString specifying the ID to provide to any VNC repeater encountered */
  repeaterID?: string;
  /** Is a boolean to indicate if to show the access controls */
  showAccessControls?: boolean;
  /** log-level for noVNC */
  vncLogging?: 'error' | 'warn' | 'none' | 'debug' | 'info';
  consoleContainerId?: string;
  additionalButtons?: React.ReactNode[];

  /** Callback. VNC server disconnected. */
  onDisconnected?: (e: any) => void;
  /** Initialization of RFB failed */
  onInitFailed?: (e: any) => void;
  /** Handshake failed */
  onSecurityFailure?: (e: any) => void;

  /* Text content rendered inside the EmptyState in the "Connect' button for when console is disconnnected */
  textConnect?: string;
  /* Text content rendered inside the EmptyState for when console is connecting */
  textConnecting?: string | React.ReactNode;
  /* Text content rendered inside the EmptyState for when console is disconnnected */
  textDisconnected?: string;
  /** Text content rendered inside the Disconnect button */
  textDisconnect?: string;
  /** Text content rendered inside the button Send shortcut dropdown toggle */
  textSendShortcut?: string;
  /** Text content rendered inside the Ctrl-Alt-Delete dropdown entry */
  textCtrlAltDel?: string;
  /** Should console try to connect once rendering */
  autoConnect?: boolean;
  /** A custom component to replace th default connect button screen */
  CustomConnectComponent?: React.FC<{ connect: () => void }>;
};
