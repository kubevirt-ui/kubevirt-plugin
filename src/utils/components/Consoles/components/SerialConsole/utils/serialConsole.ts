import { XTermProps } from '../Xterm/utils/Xterm';

export type WebSocket = {
  destroy(): void;
  send(data: any): void;
};

export type SerialConsoleProps = XTermProps & {
  /** Initiate connection to backend. In other words, the calling components manages connection state. */
  onConnect: () => void;
  /** Close connection to backend */
  onDisconnect: () => void;
  /** Terminal produced data, like key-press */
  onData: (e: string) => void;
  /** Terminal title has been changed */
  onTitleChanged?: () => void;
  /** Connection status; a value from [''connected'; 'disconnected'; 'loading']. Default is 'loading' for a not matching value. */
  /** The number of columns to resize to */
  cols?: number;
  /** The number of rows to resize to */
  rows?: number;
  fontFamily?: string;
  fontSize?: number;
  status?: string;
  /** Text content rendered inside the Connect button */
  textConnect?: string;
  /** Text content rendered inside the Disconnect button */
  textDisconnect?: string;
  /** Text content rendered inside the Reset button */
  textReset?: string;
  /* Text content rendered inside the EmptyState for when console is disconnnected */
  textDisconnected?: string;
  /* Text content rendered inside the EmptyState for when console is loading */
  textLoading?: string;
  /** A reference object to attach to the SerialConsole. */
  innerRef?: React.RefObject<any>;
};
