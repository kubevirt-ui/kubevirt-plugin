import React, { Dispatch, FC, memo, useCallback, useEffect, useRef } from 'react';
import { partition } from 'lodash';

import RFBCreate from '@novnc/novnc/lib/rfb';
import { initLogging } from '@novnc/novnc/lib/util/logging';
import { consoleFetchText } from '@openshift-console/dynamic-plugin-sdk';

import { INSECURE, SECURE } from '../../utils/constants';
import { isConnectionEncrypted } from '../../utils/utils';
import { ConsoleState, HTTP, HTTPS, VNC_CONSOLE_TYPE, WS, WSS } from '../utils/ConsoleConsts';
import { ConsoleComponentState } from '../utils/types';

import { VncLogLevel } from './utils/constants';
import { isSessionAlreadyInUse } from './utils/util';
import { RFB } from './utils/VncConsoleTypes';
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
import vncLogger from './VncLogger';

import './vnc-console.scss';

const { connected, connecting, disconnected, session_already_in_use } = ConsoleState;

export type VncConsoleProps = {
  basePath: string;
  scaleViewport?: boolean;
  setState: Dispatch<React.SetStateAction<ConsoleComponentState>>;
  viewOnly?: boolean;
  vncLogLevel?: VncLogLevel;
};

type RfbSession = {
  rfb: RFB;
  sessionID: number;
  testUrl: string;
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
  vncLogLevel = false,
}) => {
  const rfbRefs = useRef<RfbSession[]>([]);
  const staticRenderLocationRef = useRef(null);
  const sessionRef = useRef(0);
  const setVncState = useCallback(
    (producer: (state: ConsoleComponentState) => Partial<ConsoleComponentState>) =>
      setState((oldState) =>
        oldState.type === VNC_CONSOLE_TYPE ? { ...oldState, ...producer(oldState) } : oldState,
      ),
    [setState],
  );

  // render should be called once
  vncLogger.log(vncLogLevel, `[VncConsole] render. Active session ${sessionRef.current}.`);

  const notifyParentAboutDisconnect = useCallback(
    (targetSession: number, sourceLabel: string, sessionAlreadyInUse?: boolean) => {
      if (targetSession !== sessionRef.current) {
        vncLogger.log(
          vncLogLevel,
          `[VncConsole][${sourceLabel}] notifyParentAboutDisconnect. Session already closed. Target session ${targetSession}, active session ${sessionRef.current}.`,
          rfbRefs.current,
        );
        return;
      }
      vncLogger.log(
        vncLogLevel,
        `[VncConsole][${sourceLabel}] notifyParentAboutDisconnect. Target session ${targetSession}, active session ${sessionRef.current}, inUse=${sessionAlreadyInUse}.`,
        rfbRefs.current,
      );
      setVncState((prev) => ({
        actions: { connect: prev.actions.connect, disconnect: prev.actions.disconnect },
        state: sessionAlreadyInUse ? session_already_in_use : disconnected,
      }));
    },
    [setVncState],
  );

  const disconnect = useCallback(
    ({
      sessionID = sessionRef.current,
      sourceLabel = 'action',
    }: { sessionAlreadyInUse?: boolean; sessionID?: number; sourceLabel?: string } = {}) => {
      vncLogger.log(
        vncLogLevel,
        `[VncConsole] disconnect from ${sourceLabel}. Target session ${sessionID}, active session ${sessionRef.current}.`,
        rfbRefs.current,
      );
      const [targetAndOlderSessions, newerSessions] = partition(
        rfbRefs.current ?? [],
        (it) => sessionID < 0 || it.sessionID <= sessionID,
      );
      rfbRefs.current = newerSessions;
      targetAndOlderSessions.forEach(
        ({ rfb }) => rfb._rfbConnectionState !== 'disconnected' && rfb?.disconnect(),
      );
      if (newerSessions.length || targetAndOlderSessions.length > 1) {
        vncLogger.log(
          vncLogLevel,
          `[VncConsole] disconnect from ${sourceLabel}. Closed [${targetAndOlderSessions.length}] orphaned sessions starting with sessionID=${sessionID}, active session ${sessionRef.current}.`,
          rfbRefs.current,
        );
        // skip notification - target session already closed
        return;
      }
      const current = targetAndOlderSessions.find((it) => it.sessionID === sessionID);
      const { testUrl } = current ?? {};
      if (!testUrl) {
        // synchronous cleanup
        notifyParentAboutDisconnect(sessionID, sourceLabel);
        return;
      }

      // try HTTP request to the same url as websockets
      // the goal is to trigger an error and parse the message
      // if it fails with specific error message then VNC is in use
      // note that the test call is expected to fail
      // however under some conditions it may connect successfully
      // in both cases we need asynchronous cleanup
      consoleFetchText(testUrl)
        .then(() => notifyParentAboutDisconnect(sessionID, `${sourceLabel}-unexpected-success`))
        .catch((error) =>
          notifyParentAboutDisconnect(
            sessionID,
            `${sourceLabel}-error-triggered`,
            isSessionAlreadyInUse(error),
          ),
        );
    },
    [notifyParentAboutDisconnect],
  );

  const connect = useCallback(
    (preserveSession: boolean = true) => {
      setVncState(() => ({ state: connecting }));
      const sessionID = ++sessionRef.current;
      // prevent disconnect for old session to interact with current connection attempt
      const isMySession = () => sessionID === sessionRef.current;

      const isEncrypted = isConnectionEncrypted();
      const path = `${basePath}/vnc`;
      const port = window.location.port || (isEncrypted ? SECURE : INSECURE);
      const connectUrl = buildUrl({
        hostname: window.location.hostname,
        path,
        port,
        preserveSession,
        protocol: isEncrypted ? WSS : WS,
      });
      const rfbInst: RFB = new RFBCreate(staticRenderLocationRef.current, connectUrl);
      rfbInst.addEventListener('connect', () => {
        vncLogger.log(
          vncLogLevel,
          `[VncConsole] connect id=${sessionID} currentId=${sessionRef.current}`,
          rfbRefs.current,
        );
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

        const testUrl = buildUrl({
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
        if (abnormalDisconnect) {
          vncLogger.log(
            vncLogLevel,
            `[VncConsole] abnormal disconnect id=${sessionID} currentId=${sessionRef.current}`,
            args,
            rfbRefs.current,
          );
          // tag the session by adding a testUrl
          // that information can be later retrieved in the disconnect even handler
          rfbRefs.current =
            rfbRefs.current?.map(
              (it): RfbSession => ({
                ...it,
                testUrl: it.sessionID === sessionID ? testUrl : it.testUrl,
              }),
            ) ?? [];
        }
        // continue standard disconnect flow
        // wait for the disconnect event being triggered
        rfbSocketClose(args);
      });

      rfbInst.viewOnly = viewOnly;
      rfbInst.scaleViewport = scaleViewport;

      rfbRefs.current = [{ rfb: rfbInst, sessionID, testUrl: undefined }, ...rfbRefs.current];

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
    [basePath, viewOnly, scaleViewport, setVncState, disconnect],
  );

  // auto-connect only on first load
  useEffect(() => {
    if (!rfbRefs.current?.length) {
      vncLogLevel && initLogging(vncLogLevel);
      vncLogger.log(
        vncLogLevel,
        `[VncConsole] auto-connect. Active session ${sessionRef.current}.`,
      );
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
    // assumption: the parent keeps the object tree stable
    // and prevents re-creating this component (the render is called once)
    // Thanks to that the the cleanup is launched only when the parent is unmounted
    // At this point we don't notify the parent and can just close all sessions
    return () => disconnect({ sessionID: -1, sourceLabel: 'useEffect' });
  });

  return <div className={'vnc-container'} ref={staticRenderLocationRef} />;
};

export default memo(VncConsole);
