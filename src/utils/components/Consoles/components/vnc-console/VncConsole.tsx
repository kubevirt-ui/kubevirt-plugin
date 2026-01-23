import React, { FC, memo, useEffect, useRef } from 'react';

import RFBCreate from '@novnc/novnc/lib/rfb';
import { getLogging, initLogging } from '@novnc/novnc/lib/util/logging';

import { INSECURE, SECURE } from '../../utils/constants';
import { isConnectionEncrypted } from '../../utils/utils';
import { ConsoleState, HTTP, HTTPS, VNC_CONSOLE_TYPE, WS, WSS } from '../utils/ConsoleConsts';
import { ConsoleComponentState } from '../utils/types';

import { ALL_SESSIONS, AUTO_CONNECT, USER_CONNECT, WARN } from './utils/constants';
import * as utils from './utils/util';
import { RFB, RfbSession, VncConsoleProps } from './utils/VncConsoleTypes';
import { sendCtrlAlt1, sendCtrlAlt2, sendPasteCMD } from './actions';
import vncLogger from './VncLogger';

import './vnc-console.scss';

const { connected, connecting } = ConsoleState;

export const VncConsole: FC<VncConsoleProps> = ({
  basePath,
  scaleViewport = true,
  setState,
  viewOnly = false,
  vncLogLevel = false,
}) => {
  const rfbRefs = useRef<RfbSession[]>([]);
  const staticRenderLocationRef = useRef(null);
  const sessionRef = useRef(0);
  const setVncState = (
    producer: (state: ConsoleComponentState) => Partial<ConsoleComponentState>,
  ) =>
    setState((oldState) =>
      oldState.type === VNC_CONSOLE_TYPE ? { ...oldState, ...producer(oldState) } : oldState,
    );
  const log = (...args: unknown[]) => vncLogger.log(vncLogLevel, ...args, rfbRefs.current);

  // render should be called once
  log(`[VncConsole] render. Active session ${sessionRef.current}.`);

  const disconnect = ({ sessionID = sessionRef.current, sourceLabel = 'action' } = {}) =>
    utils.disconnect({ log, rfbRefs, sessionID, sessionRef, setVncState, sourceLabel });

  const connect = (sourceLabel: string, preserveSession: boolean = true): void => {
    setVncState(() => ({ state: connecting }));
    const sessionID = ++sessionRef.current;
    // prevent disconnect for old session to interact with current connection attempt
    const isMySession = () => sessionID === sessionRef.current;

    const isEncrypted = isConnectionEncrypted();
    const path = `${basePath}/vnc`;
    const port = window.location.port || (isEncrypted ? SECURE : INSECURE);
    const connectUrl = utils.buildUrl({
      hostname: window.location.hostname,
      path,
      port,
      preserveSession,
      protocol: isEncrypted ? WSS : WS,
    });
    const rfbInst: RFB = new RFBCreate(staticRenderLocationRef.current, connectUrl);
    rfbInst.addEventListener('connect', () => {
      log(`[VncConsole][${sourceLabel}] connect id=${sessionID} currentId=${sessionRef.current}`);
      isMySession() && setVncState(() => ({ state: connected }));
    });
    rfbInst.addEventListener('disconnect', () =>
      disconnect({ sessionID, sourceLabel: 'disconnectEvent' }),
    );

    // noVNC's public API (disconnect event) does not expose error codes.
    // To detect specific WebSocket close codes we need to add our own callback.
    // The original callback will be called inside the wrapper.
    // Note that clean-up is not affected (will be performed by rfb as before).
    const rfbSocketClose = rfbInst._socketClose.bind(rfbInst);
    rfbInst._sock.on('close', (args) => {
      // 1006 code === connection was closed abnormally (according to the WS protocol)
      // triggered by 5xx HTTP server error
      // kubevirt API server is not closing the connection gracefully
      // so "standard" disconnect will also trigger this code
      const abnormalDisconnect = args.code === 1006;
      const isConnecting = rfbInst?._rfbConnectionState === 'connecting';
      const isUserConnect = sourceLabel === USER_CONNECT;

      const testUrl = utils.buildUrl({
        hostname: window.location.hostname,
        path,
        port,
        // always test with preserveSession turned on
        // otherwise the test will steal the connection
        preserveSession: true,
        // we need to test with http protocol due to bug:
        // https://github.com/kubevirt/kubevirt/issues/16273
        protocol: isEncrypted ? HTTPS : HTTP,
      });
      if (abnormalDisconnect && isConnecting && isUserConnect) {
        log(
          `[VncConsole] abnormal disconnect id=${sessionID} currentId=${sessionRef.current}`,
          args,
        );
        // tag the session by adding a testUrl
        // that information can be later retrieved in the disconnect even handler
        rfbRefs.current =
          rfbRefs.current?.map(
            (session): RfbSession => ({
              ...session,
              testUrl: session.sessionID === sessionID ? testUrl : session.testUrl,
            }),
          ) ?? [];
      }
      // continue standard disconnect flow
      // wait for the disconnect event being triggered
      rfbSocketClose(args);
    });

    rfbInst.viewOnly = viewOnly;
    rfbInst.scaleViewport = scaleViewport;

    rfbRefs.current = [{ rfb: rfbInst, sessionID }, ...rfbRefs.current];

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
  };

  // auto-connect only on first load
  useEffect(() => {
    if (rfbRefs.current?.length) {
      log(`[VncConsole] Session queue dirty on initialization.`, rfbRefs.current);
      return;
    }

    if (getLogging() !== vncLogLevel) {
      initLogging(vncLogLevel || WARN);
    }

    log(`[VncConsole] auto-connect. Active session ${sessionRef.current}.`);
    connect(AUTO_CONNECT);
    const userConnect = (preserveSession?: boolean) => connect(USER_CONNECT, preserveSession);
    setVncState((prev) => ({
      actions: {
        // keep the methods bound during connect()
        ...prev.actions,
        // add stable methods (semi-constant)
        connect: userConnect,
        disconnect,
      },
    }));
    // assumption: the parent keeps the object tree stable
    // and prevents re-creating this component (the render is called once)
    // Thanks to that the the cleanup is launched only when the parent is unmounted
    // At this point we don't notify the parent and can just close all sessions
    return () => disconnect({ sessionID: ALL_SESSIONS, sourceLabel: 'useEffect' });
  }, []);

  return <div className={'vnc-container'} ref={staticRenderLocationRef} />;
};

export default memo(VncConsole);
