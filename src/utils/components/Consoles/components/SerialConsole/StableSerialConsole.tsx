import React, { Dispatch, FC, useCallback, useEffect, useRef, useState } from 'react';

import { AttachAddon } from '@xterm/addon-attach';
import {
  BrowserClipboardProvider,
  ClipboardAddon,
  ClipboardSelectionType,
} from '@xterm/addon-clipboard';
import { Terminal } from '@xterm/xterm';

import { INSECURE, SECURE } from '../../utils/constants';
import { isConnectionEncrypted } from '../../utils/utils';
import { AccessConsolesActions } from '../AccessConsoles/utils/accessConsoles';
import { ConsoleState, SERIAL_CONSOLE_TYPE, WS, WSS } from '../utils/ConsoleConsts';

type SerialConsoleConnectorProps = {
  basePath: string;
  setActions: Dispatch<React.SetStateAction<AccessConsolesActions>>;
  setState: (state: ConsoleState) => void;
};

const createURL = (host: string, path: string): string => {
  let url;

  if (host === 'auto') {
    if (window.location.protocol === 'https:') {
      url = 'wss://';
    } else {
      url = 'ws://';
    }
    url += window.location.host;
  } else {
    url = host;
  }

  if (path) {
    url += path;
  }

  return url;
};

const StableSerialConsole: FC<SerialConsoleConnectorProps> = ({
  basePath,
  setActions,
  setState,
}) => {
  const [xterm, setXterm] = useState<Terminal>(null);
  const terminalRef = useRef(null);

  const disconnect = useCallback(() => {
    if (!xterm) {
      return;
    }
    xterm.dispose();
    setState(ConsoleState.disconnected);
    setActions((actions) => (actions.type === SERIAL_CONSOLE_TYPE ? {} : actions));
    setXterm(null);
    //setters are stable because they come from useState hook
  }, [xterm, setState, setActions]);

  // eslint-disable-next-line no-console
  console.log('Foo:serial:render');

  const connect = useCallback(() => {
    const websocketOptions = {
      host: `${isConnectionEncrypted() ? WSS : WS}://${window.location.hostname}:${
        window.location.port || (isConnectionEncrypted() ? SECURE : INSECURE)
      }`,
      jsonParse: false,
      path: `/${basePath}/console`,
      reconnect: false,
      subprotocols: ['plain.kubevirt.io'],
    };

    const url = createURL(websocketOptions.host, websocketOptions.path);

    // eslint-disable-next-line no-console
    console.log('Foo:serial:connect', url);

    const ws = new WebSocket(url, websocketOptions.subprotocols);

    const terminal = new Terminal({
      cursorBlink: true,
      screenReaderMode: true,
    });

    const attachAddon = new AttachAddon(ws);
    const clipboardAddon = new ClipboardAddon();
    terminal.loadAddon(attachAddon);
    terminal.loadAddon(clipboardAddon);

    setXterm(terminal);
  }, [basePath, setXterm]);

  useEffect(() => {
    if (!xterm) {
      connect();
    } else {
      // eslint-disable-next-line no-console
      console.log('Foo:serial:actions');
      setActions({
        connect,
        disconnect,
        sendPaste: async () => {
          const clipboardProvider = new BrowserClipboardProvider();
          const text = await clipboardProvider.readText(ClipboardSelectionType.SYSTEM);
          xterm?.paste(text);
        },
        type: SERIAL_CONSOLE_TYPE,
      });
    }

    return () => {
      if (xterm) {
        disconnect();
      }
    };
  }, [disconnect, connect, xterm, setActions]);

  return (
    <>
      <div className="pf-v6-c-console__xterm" ref={terminalRef} role="list" />
    </>
  );
};

export default StableSerialConsole;
