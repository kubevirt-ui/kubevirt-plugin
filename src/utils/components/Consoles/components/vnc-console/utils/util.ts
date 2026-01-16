import { MutableRefObject } from 'react';
import partition from 'lodash/partition';

import { sleep } from '@kubevirt-utils/components/Consoles/utils/utils';
import RFBCreate from '@novnc/novnc/lib/rfb';
import { consoleFetchText } from '@openshift-console/dynamic-plugin-sdk';

import { ConsoleState } from '../../utils/ConsoleConsts';
import { ConsoleComponentState } from '../../utils/types';

import { ALL_SESSIONS, KEYBOARD_DELAY, VNC_IN_USE_ERROR_TEXT, VNC_LOG_LEVELS } from './constants';
import { RFB, RfbSession, VncLogLevel } from './VncConsoleTypes';

// eslint-disable-next-line require-jsdoc
export function isVncLogLevel(value: unknown): value is VncLogLevel {
  return value === false || (VNC_LOG_LEVELS as unknown as unknown[]).includes(value);
}

export const isSessionAlreadyInUse = (error: Error): boolean => {
  return error?.message?.includes?.(VNC_IN_USE_ERROR_TEXT) ?? false;
};

export const isConnectableState = (state: ConsoleState) =>
  [
    ConsoleState.connecting,
    ConsoleState.disconnected,
    ConsoleState.session_already_in_use,
  ].includes(state);

/**
 * Add delay to QEMUExtendedKeyEvent
 * @param rfb to be used as 'this'
 * @param keysym keysym - see @novnc/novnc/lib/input/keysym
 * @param down true if the key was pressed
 * @param scanCode scanCode - see @novnc/novnc/lib/input/xtscancodes
 */
export async function typeAndWait(
  rfb: RFB,
  keysym: number,
  down: boolean,
  scanCode: number,
): Promise<void> {
  RFBCreate.messages.QEMUExtendedKeyEvent(rfb._sock, keysym, down, scanCode);
  // long text is getting truncated without a delay
  await sleep(KEYBOARD_DELAY);
}

// Example: 10 -> "U+000A"
export const toUnicodeFormat = (codePoint: number): string =>
  `U+${codePoint.toString(16).padStart(4, '0').toUpperCase()}`;

export const notifyParentAboutDisconnect = ({
  log,
  sessionAlreadyInUse,
  sessionRef,
  setVncState,
  sourceLabel,
  targetSession,
}: {
  log: (...args: unknown[]) => void;
  sessionAlreadyInUse?: boolean;
  sessionRef: MutableRefObject<number>;
  setVncState: (producer: (state: ConsoleComponentState) => Partial<ConsoleComponentState>) => void;
  sourceLabel: string;
  targetSession: number;
}) => {
  if (targetSession !== sessionRef.current) {
    log(
      `[VncConsole][${sourceLabel}] notifyParentAboutDisconnect. Session already closed. Target session ${targetSession}, active session ${sessionRef.current}.`,
    );
    return;
  }
  log(
    `[VncConsole][${sourceLabel}] notifyParentAboutDisconnect. Target session ${targetSession}, active session ${sessionRef.current}, inUse=${sessionAlreadyInUse}.`,
  );
  setVncState((prev) => ({
    actions: { connect: prev.actions.connect, disconnect: prev.actions.disconnect },
    state: sessionAlreadyInUse ? ConsoleState.session_already_in_use : ConsoleState.disconnected,
  }));
};

export const buildUrl = ({
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

export const disconnect = ({
  log,
  rfbRefs,
  sessionID,
  sessionRef,
  setVncState,
  sourceLabel,
}: {
  log: (...args: unknown[]) => void;
  rfbRefs: MutableRefObject<RfbSession[]>;
  sessionID?: number;
  sessionRef: MutableRefObject<number>;
  setVncState: (producer: (state: ConsoleComponentState) => Partial<ConsoleComponentState>) => void;
  sourceLabel?: string;
}) => {
  log(
    `[VncConsole] disconnect from ${sourceLabel}. Target session ${sessionID}, active session ${sessionRef.current}.`,
  );
  const [targetAndOlderSessions, newerSessions] = partition(
    rfbRefs.current ?? [],
    (session) => sessionID === ALL_SESSIONS || session.sessionID <= sessionID,
  );
  rfbRefs.current = newerSessions;
  targetAndOlderSessions.forEach(
    ({ rfb }) => rfb?._rfbConnectionState !== 'disconnected' && rfb?.disconnect(),
  );
  if (newerSessions.length || targetAndOlderSessions.length > 1) {
    log(
      `[VncConsole] disconnect from ${sourceLabel}. Closed [${targetAndOlderSessions.length}] orphaned sessions starting with sessionID=${sessionID}, active session ${sessionRef.current}.`,
    );
    // skip notification - target session already closed
    return;
  }
  const current = targetAndOlderSessions.find((session) => session.sessionID === sessionID);
  const { testUrl } = current ?? {};
  if (!testUrl) {
    // synchronous cleanup
    notifyParentAboutDisconnect({
      log,
      sessionRef,
      setVncState,
      sourceLabel,
      targetSession: sessionID,
    });
    return;
  }

  // try HTTP request to the same url as websockets
  // the goal is to trigger an error and parse the message
  // if it fails with specific error message then VNC is in use
  // note that the test call is expected to fail
  // however under some conditions it may connect successfully
  // in both cases we need asynchronous cleanup
  consoleFetchText(testUrl)
    .then(() =>
      notifyParentAboutDisconnect({
        log,
        sessionRef,
        setVncState,
        sourceLabel: `${sourceLabel}-unexpected-success`,
        targetSession: sessionID,
      }),
    )
    .catch((error) =>
      notifyParentAboutDisconnect({
        log,
        sessionAlreadyInUse: isSessionAlreadyInUse(error),
        sessionRef,
        setVncState,
        sourceLabel: `${sourceLabel}-error-triggered`,
        targetSession: sessionID,
      }),
    );
};
