/* eslint-disable no-console */
import React, { Dispatch, FC, memo, useCallback, useEffect, useRef } from 'react';

import RFBCreate from '@novnc/novnc/lib/rfb';
import { consoleFetchText } from '@openshift-console/dynamic-plugin-sdk';

import { INSECURE, SECURE } from '../../utils/constants';
import { isConnectionEncrypted } from '../../utils/utils';
import { ConsoleState, HTTP, HTTPS, VNC_CONSOLE_TYPE, WS, WSS } from '../utils/ConsoleConsts';
import { ConsoleComponentState } from '../utils/types';

import { isSessionAlreadyInUse } from './utils/util';
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

const { connected, connecting, disconnected, session_already_in_use } = ConsoleState;

export type VncConsoleProps = {
  basePath: string;
  scaleViewport?: boolean;
  setState: Dispatch<React.SetStateAction<ConsoleComponentState>>;
  viewOnly?: boolean;
};

const buildUrl = ({
  hostname,
  path,
  port,
  preserveSession,
  protocol,
}: {
  hostname: string;
  path: string;
  port: string;
  preserveSession: boolean;
  protocol: string;
}): string =>
  `${protocol}://${hostname}:${port}${path}?preserveSession=${Boolean(preserveSession).toString()}`;

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
    (preserveSession: boolean = true) => {
      let abnormalDisconnect = false;
      setVncState(() => ({ state: connecting }));
      const sessionID = ++sessionRef.current;
      // prevent disconnect for old session to interact with current connection attempt
      const isMySession = () => sessionID === sessionRef.current;

      const isEncrypted = isConnectionEncrypted();
      const path = `${basePath}/vnc`;
      const port = window.location.port || (isEncrypted ? SECURE : INSECURE);
      const url = buildUrl({
        hostname: window.location.hostname,
        path,
        port,
        preserveSession,
        protocol: isEncrypted ? WSS : WS,
      });
      const rfbInst = new RFBCreate(staticRenderLocationRef.current, url);
      rfbInst.addEventListener(
        'connect',
        () => isMySession() && setVncState(() => ({ state: connected })),
      );
      rfbInst.addEventListener('disconnect', () => {
        if (isMySession() && !abnormalDisconnect) {
          postDisconnectCleanup(false);
        }
      });

      // noVNC's public API (disconnect event) does not expose error codes.
      // To detect specific WebSocket close codes we need to add our own callback.
      // The original callback will be called inside the wrapper.
      // Note that clean-up is not affected (will be performed by rfb as before).
      const rfbSocketClose = rfbInst._socketClose.bind(rfbInst);
      rfbInst._sock.on('close', (args) => {
        // 1006 code === connection was closed abnormally
        // triggered by 5xx HTTP server error
        abnormalDisconnect = args.code === 1006;
        rfbSocketClose(args);

        if (!abnormalDisconnect) {
          //continue standard disconnect flow
          return;
        }
        // try HTTP request to the same url as websockets
        // if it fails with specific error message then VNC is in use
        consoleFetchText(
          buildUrl({
            hostname: window.location.hostname,
            path,
            port,
            preserveSession,
            protocol: isEncrypted ? HTTPS : HTTP,
          }),
        )
          .then(() => isMySession() && postDisconnectCleanup(false))
          .catch((error) => isMySession() && postDisconnectCleanup(isSessionAlreadyInUse(error)));
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
