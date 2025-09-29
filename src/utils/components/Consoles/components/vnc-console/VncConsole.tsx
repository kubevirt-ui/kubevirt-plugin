/* eslint-disable no-console */
import React, { Dispatch, FC, memo, useCallback, useEffect, useRef, useState } from 'react';

import RFBCreate from '@novnc/novnc/lib/rfb';

import { INSECURE, SECURE } from '../../utils/constants';
import { isConnectionEncrypted } from '../../utils/utils';
import { ConsoleState, VNC_CONSOLE_TYPE, WS, WSS } from '../utils/ConsoleConsts';
import { ConsoleComponentState } from '../utils/types';

import { sendCtrlAlt1, sendCtrlAlt2, sendPasteCMD } from './actions';

import './vnc-console.scss';

const { connected, connecting, disconnected } = ConsoleState;

export type VncConsoleProps = {
  basePath: string;
  defaultShared?: boolean;
  scaleViewport?: boolean;
  setState: Dispatch<React.SetStateAction<ConsoleComponentState>>;
  viewOnly?: boolean;
};

export const VncConsole: FC<VncConsoleProps> = ({
  basePath,
  defaultShared = true,
  scaleViewport = true,
  setState,
  viewOnly = false,
}) => {
  const rfbRef = useRef<RFBCreate>(null);
  const staticRenderLocationRef = useRef(null);
  const sessionRef = useRef(0);
  // reload component when connection mode changes
  const [shared, setShared] = useState<boolean>(defaultShared);
  const setVncState = useCallback(
    (producer: (state: ConsoleComponentState) => Partial<ConsoleComponentState>) =>
      setState((oldState) =>
        oldState.type === VNC_CONSOLE_TYPE ? { ...oldState, ...producer(oldState) } : oldState,
      ),
    [setState],
  );

  const postDisconnectCleanup = useCallback(() => {
    rfbRef.current = null;
    setVncState((prev) => ({
      actions: { connect: prev.actions.connect, disconnect: prev.actions.disconnect },
      state: disconnected,
    }));
  }, [setVncState]);

  const disconnect = useCallback(() => {
    if (!rfbRef.current) {
      return;
    }
    rfbRef.current.disconnect();
    postDisconnectCleanup();
  }, [postDisconnectCleanup]);

  const connect = useCallback(() => {
    setVncState(() => ({ state: connecting }));
    const sessionID = ++sessionRef.current;

    const isEncrypted = isConnectionEncrypted();
    const path = `${basePath}/vnc`;
    const port = window.location.port || (isEncrypted ? SECURE : INSECURE);
    const url = `${isEncrypted ? WSS : WS}://${
      window.location.hostname
    }:${port}${path}?preserveSession=${Boolean(shared).toString()}`;
    const rfbInst = new RFBCreate(staticRenderLocationRef.current, url, { shared });
    rfbInst.addEventListener(
      'connect',
      () => sessionID === sessionRef.current && setVncState(() => ({ state: connected })),
    );
    rfbInst.addEventListener('disconnect', () => {
      // prevent disconnect for old session to interact with current connection attempt
      sessionID === sessionRef.current && postDisconnectCleanup();
    });
    rfbInst.viewOnly = viewOnly;
    rfbInst.scaleViewport = scaleViewport;

    rfbRef.current = rfbInst;

    setVncState((prev) => ({
      actions: {
        vncSettings: { setShared, shared },
        // get methods that are not bound to rfb instance (i.e. connect())
        // those are initialized during initial loading with useEffect
        ...prev.actions,
        sendCtrlAlt1: sendCtrlAlt1.bind(rfbInst),
        sendCtrlAlt2: sendCtrlAlt2.bind(rfbInst),
        sendCtrlAltDel: rfbInst.sendCtrlAltDel?.bind(rfbInst),
        sendPaste: sendPasteCMD.bind(rfbInst),
      },
    }));
  }, [basePath, viewOnly, scaleViewport, setVncState, postDisconnectCleanup, shared, setShared]);

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
