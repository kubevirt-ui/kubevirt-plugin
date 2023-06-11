import { XTermProps } from '../Xterm/utils/Xterm';

export type WebSocket = {
  destroy(): void;
  send(data: any): void;
};

export type SerialConsoleProps = XTermProps & {
  /** The number of columns to resize to */
  cols?: number;
  fontFamily?: string;
  fontSize?: number;
  /** A reference object to attach to the SerialConsole. */
  innerRef?: React.RefObject<any>;
  /** Connection status; a value from [''connected'; 'disconnected'; 'loading']. Default is 'loading' for a not matching value. */
  /** Initiate connection to backend. In other words, the calling components manages connection state. */
  onConnect: () => void;
  /** Terminal produced data, like key-press */
  onData: (e: string) => void;
  /** Close connection to backend */
  onDisconnect: () => void;
  /** Terminal title has been changed */
  onTitleChanged?: () => void;
  /** The number of rows to resize to */
  rows?: number;
  status?: string;
  /** Text content rendered inside the Connect button */
  textConnect?: string;
  /** Text content rendered inside the Disconnect button */
  textDisconnect?: string;
  /* Text content rendered inside the EmptyState for when console is disconnnected */
  textDisconnected?: string;
  /* Text content rendered inside the EmptyState for when console is loading */
  textLoading?: string;
  /** Text content rendered inside the Reset button */
  textReset?: string;
};
