import React, { Dispatch, FC, memo, useCallback, useEffect, useRef } from 'react';

import { ClipboardAddon } from '@xterm/addon-clipboard';
import { FitAddon } from '@xterm/addon-fit';
import { IDisposable, Terminal } from '@xterm/xterm';

import { INSECURE, SECURE } from '../../utils/constants';
import { isConnectionEncrypted, readFromClipboard } from '../../utils/utils';
import { ConsoleState, SERIAL_CONSOLE_TYPE, WS, WSS } from '../utils/ConsoleConsts';
import { ConsoleComponentState } from '../utils/types';

import { addResizeListener, createURL, removeResizeListenerIfExists } from './utils/serialConsole';
import { addSocketListener, BlobOnlyAttachAddon } from './BlobOnlyAttachAddon';

import '@xterm/xterm/css/xterm.css';

type SerialConsoleConnectorProps = {
  basePath: string;
  setState: Dispatch<React.SetStateAction<ConsoleComponentState>>;
};

const SerialConsole: FC<SerialConsoleConnectorProps> = ({ basePath, setState }) => {
  const xtermRef = useRef<Terminal>(null);
  const terminalRef = useRef(null);
  const resizeListenerRef = useRef(null);
  const setSerialState = useCallback(
    (producer: (state: ConsoleComponentState) => Partial<ConsoleComponentState>) =>
      setState((oldState) =>
        oldState.type === SERIAL_CONSOLE_TYPE ? { ...oldState, ...producer(oldState) } : oldState,
      ),
    [setState],
  );

  const disconnect = useCallback(() => {
    removeResizeListenerIfExists(resizeListenerRef.current);
    if (!xtermRef.current) {
      return;
    }
    const temp = xtermRef.current;
    xtermRef.current = null;
    temp.dispose();
  }, []);

  const connect = useCallback(() => {
    setSerialState(() => ({
      state: ConsoleState.connecting,
    }));
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

    const fitAddon = new FitAddon();

    const ws = new WebSocket(url, websocketOptions.subprotocols);
    const disposables: IDisposable[] = [
      addSocketListener(ws, 'open', () => {
        setSerialState(() => ({
          state: ConsoleState.connected,
        }));
        terminal.open(terminalRef.current);
        terminal.focus();
        removeResizeListenerIfExists(resizeListenerRef.current);
        resizeListenerRef.current = addResizeListener(fitAddon.fit.bind(fitAddon));
        fitAddon.fit();
      }),
      addSocketListener(ws, 'close', () => {
        disconnect();
      }),
      addSocketListener(ws, 'error', () => {
        disconnect();
      }),
    ];
    const terminal = new Terminal({
      cursorBlink: true,
      cursorStyle: 'underline',
      fontFamily: 'monospace',
      fontSize: 14,
      screenReaderMode: true,
    });

    const attachAddon = new BlobOnlyAttachAddon(ws, { bidirectional: true });
    const clipboardAddon = new ClipboardAddon();
    terminal.loadAddon(attachAddon);
    terminal.loadAddon(clipboardAddon);
    terminal.loadAddon(fitAddon);
    // cleanup addon
    terminal.loadAddon({
      activate: () => {},
      dispose: () => {
        disposables.forEach((it) => it.dispose());
        setSerialState(() => ({
          // paste action is not bound to terminal object and can be used with next terminal
          state: ConsoleState.disconnected,
        }));
      },
    });

    xtermRef.current = terminal;
  }, [basePath, setSerialState, disconnect]);

  useEffect(() => {
    if (!xtermRef.current) {
      connect();
      setSerialState(() => ({
        actions: {
          connect,
          disconnect,
          sendPaste: async () => {
            const text = await readFromClipboard();
            if (typeof text === 'string') {
              xtermRef.current?.paste(text);
            }
          },
        },
      }));
    }

    return () => disconnect();
  }, [disconnect, connect, setSerialState]);

  return (
    <>
      <div className="console-container" ref={terminalRef} role="list" />
    </>
  );
};

export default memo(SerialConsole);
