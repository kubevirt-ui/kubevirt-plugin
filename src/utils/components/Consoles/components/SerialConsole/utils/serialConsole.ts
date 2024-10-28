import { RefObject } from 'react';

import { XTermProps } from '../Xterm/utils/Xterm';

export type WebSocket = {
  destroy(): void;
  getState(): string;
  send(data: any): void;
};

export type SerialConsoleProps = XTermProps & {
  /** A reference object to attach to the SerialConsole. */
  innerRef?: RefObject<any>;
  /** Connection status; a value from [''connected'; 'disconnected'; 'loading']. Default is 'loading' for a not matching value. */
  /** Initiate connection to backend. In other words, the calling components manages connection state. */
  onConnect: () => void;
  /** Terminal produced data, like key-press */
  onData: (e: string) => void;
  /** Close connection to backend */
  onDisconnect: () => void;
  /** Terminal title has been changed */
  onTitleChanged?: () => void;
  status?: string;
};
