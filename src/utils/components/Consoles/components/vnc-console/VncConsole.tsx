/* eslint-disable no-console */
import React, { Dispatch, FC, memo, useCallback, useEffect, useRef } from 'react';

import RFBCreate from '@novnc/novnc/lib/rfb';

import { INSECURE, SECURE } from '../../utils/constants';
import { isConnectionEncrypted } from '../../utils/utils';
import { ConsoleState, VNC_CONSOLE_TYPE, WS, WSS } from '../utils/ConsoleConsts';
import { ConsoleComponentState } from '../utils/types';

import {
  sendCtrlAlt1,
  sendCtrlAlt2,
  sendF1,
  sendF10,
  sendF11,
  sendF12,
  sendF2,
  sendF3,
  sendF4,
  sendF5,
  sendF6,
  sendF7,
  sendF8,
  sendF9,
  sendPasteCMD,
} from './actions';

import './vnc-console.scss';

const { connected, connecting, disconnected } = ConsoleState;

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
    const url = `${isEncrypted ? WSS : WS}://${window.location.hostname}:${port}${path}`;
    const rfbInst = new RFBCreate(staticRenderLocationRef.current, url);
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
        // get methods that are not bound to rfb instance (i.e. connect())
        // those are initialized during initial loading with useEffect
        ...prev.actions,
        sendCtrlAlt1: sendCtrlAlt1.bind(rfbInst),
        sendCtrlAlt2: sendCtrlAlt2.bind(rfbInst),
        sendCtrlAltDel: rfbInst.sendCtrlAltDel?.bind(rfbInst),
        sendF1: sendF1.bind(rfbInst),
        sendF10: sendF10.bind(rfbInst),
        sendF11: sendF11.bind(rfbInst),
        sendF12: sendF12.bind(rfbInst),
        sendF2: sendF2.bind(rfbInst),
        sendF3: sendF3.bind(rfbInst),
        sendF4: sendF4.bind(rfbInst),
        sendF5: sendF5.bind(rfbInst),
        sendF6: sendF6.bind(rfbInst),
        sendF7: sendF7.bind(rfbInst),
        sendF8: sendF8.bind(rfbInst),
        sendF9: sendF9.bind(rfbInst),
        sendPaste: sendPasteCMD.bind(rfbInst),
      },
    }));
  }, [basePath, viewOnly, scaleViewport, setVncState, postDisconnectCleanup]);

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
