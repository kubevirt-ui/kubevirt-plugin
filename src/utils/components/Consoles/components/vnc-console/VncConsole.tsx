/* eslint-disable no-console */
import React, { Dispatch, FC, memo, useCallback, useEffect, useRef } from 'react';

import RFBCreate from '@novnc/novnc/lib/rfb';

import { INSECURE, SECURE } from '../../utils/constants';
import { isConnectionEncrypted } from '../../utils/utils';
import { ConsoleState, VNC_CONSOLE_TYPE, WS, WSS } from '../utils/ConsoleConsts';
import { ConsoleComponentState } from '../utils/types';

import { isSessionAlreadyInUse } from './utils/util';
import { sendCtrlAlt1, sendCtrlAlt2, sendPasteCMD } from './actions';

import './vnc-console.scss';

const { connected, connecting, disconnected, session_already_in_use } = ConsoleState;

export type VncConsoleProps = {
  basePath: string;
  scaleViewport?: boolean;
  setState: Dispatch<React.SetStateAction<ConsoleComponentState>>;
  viewOnly?: boolean;
};

export const VncConsole: FC<VncConsoleProps> = ({
  basePath,
  scaleViewport = true,
  setState,
  viewOnly = false,
}) => {
  const rfbRef = useRef<RFBCreate>(null);
  const staticRenderLocationRef = useRef(null);
  const sessionRef = useRef(0);
  const setVncState = useCallback(
    (producer: (state: ConsoleComponentState) => Partial<ConsoleComponentState>) =>
      setState((oldState) =>
        oldState.type === VNC_CONSOLE_TYPE ? { ...oldState, ...producer(oldState) } : oldState,
      ),
    [setState],
  );

  const postDisconnectCleanup = useCallback(
    (sessionAlreadyInUse?: boolean) => {
      rfbRef.current = null;
      setVncState((prev) => ({
        actions: { connect: prev.actions.connect, disconnect: prev.actions.disconnect },
        state: sessionAlreadyInUse ? session_already_in_use : disconnected,
      }));
    },
    [setVncState],
  );

  const disconnect = useCallback(() => {
    if (!rfbRef.current) {
      return;
    }
    rfbRef.current.disconnect();
    postDisconnectCleanup();
  }, [postDisconnectCleanup]);

  const connect = useCallback(
    (preserveSession = true) => {
      setVncState(() => ({ state: connecting }));
      const sessionID = ++sessionRef.current;

      const isEncrypted = isConnectionEncrypted();
      const path = `${basePath}/vnc`;
      const port = window.location.port || (isEncrypted ? SECURE : INSECURE);
      const url = `${isEncrypted ? WSS : WS}://${
        window.location.hostname
      }:${port}${path}?preserveSession=${Boolean(preserveSession).toString()}`;
      const rfbInst = new RFBCreate(staticRenderLocationRef.current, url);
      rfbInst.addEventListener(
        'connect',
        () => sessionID === sessionRef.current && setVncState(() => ({ state: connected })),
      );
      rfbInst.addEventListener('disconnect', (args) => {
        // prevent disconnect for old session to interact with current connection attempt
        if (sessionID === sessionRef.current) {
          postDisconnectCleanup(isSessionAlreadyInUse(args));
        }
      });
      rfbInst.viewOnly = viewOnly;
      rfbInst.scaleViewport = scaleViewport;

      rfbRef.current = rfbInst;

      setVncState((prev) => ({
        actions: {
          // get methods that are not bound to rfb instance (i.e. connect())
          // those are initialized during initial loading with useEffect
          ...prev.actions,
          sendCtrlAlt1: sendCtrlAlt1.bind(rfbInst),
          sendCtrlAlt2: sendCtrlAlt2.bind(rfbInst),
          sendCtrlAltDel: rfbInst.sendCtrlAltDel?.bind(rfbInst),
          sendPaste: sendPasteCMD.bind(rfbInst),
        },
      }));
    },
    [basePath, viewOnly, scaleViewport, setVncState, postDisconnectCleanup],
  );

  // auto-connect only on first load
  useEffect(() => {
    if (!rfbRef.current) {
      connect();
      setVncState((prev) => ({
        actions: {
          // keep the methods bound during connect()
          ...prev.actions,
          // add stable methods (semi-constant)
          connect,
          disconnect,
        },
      }));
    }
    return () => disconnect();
  });

  return <div className={'vnc-container'} ref={staticRenderLocationRef} />;
};

export default memo(VncConsole);
