import type { MutableRefObject } from 'react';

import { ConsoleState } from '../../utils/ConsoleConsts';
import { type ConsoleComponentState } from '../../utils/types';

const getDisconnectState = (forbidden?: boolean, sessionAlreadyInUse?: boolean): ConsoleState => {
  if (forbidden) return ConsoleState.Forbidden;
  if (sessionAlreadyInUse) return ConsoleState.SessionAlreadyInUse;
  return ConsoleState.Disconnected;
};

export const notifyParentAboutDisconnect = ({
  forbidden,
  log,
  sessionAlreadyInUse,
  sessionRef,
  setVncState,
  sourceLabel,
  targetSession,
}: {
  forbidden?: boolean;
  log: (...args: unknown[]) => void;
  sessionAlreadyInUse?: boolean;
  sessionRef: MutableRefObject<number>;
  setVncState: (producer: (state: ConsoleComponentState) => Partial<ConsoleComponentState>) => void;
  sourceLabel: string;
  targetSession: number;
}): void => {
  if (targetSession !== sessionRef.current) {
    log(
      `[VncConsole][${sourceLabel}] notifyParentAboutDisconnect. Session already closed. Target session ${targetSession}, active session ${sessionRef.current}.`,
    );
    return;
  }
  log(
    `[VncConsole][${sourceLabel}] notifyParentAboutDisconnect. Target session ${targetSession}, active session ${sessionRef.current}, inUse=${sessionAlreadyInUse}, forbidden=${forbidden}.`,
  );
  setVncState((prev) => ({
    actions: { connect: prev.actions.connect, disconnect: prev.actions.disconnect },
    state: getDisconnectState(forbidden, sessionAlreadyInUse),
  }));
};
