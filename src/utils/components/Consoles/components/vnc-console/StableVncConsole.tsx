import React, { Dispatch, FC, memo, useCallback, useEffect, useRef, useState } from 'react';

import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import RFBCreate from '@novnc/novnc/lib/rfb';
import { initLogging } from '@novnc/novnc/lib/util/logging';

import { INSECURE, SECURE } from '../../utils/constants';
import { isConnectionEncrypted } from '../../utils/utils';
import { AccessConsolesActions } from '../AccessConsoles/utils/accessConsoles';
import { ConsoleState, VNC_CONSOLE_TYPE, WS, WSS } from '../utils/ConsoleConsts';

import { CustomConnectComponentProps } from './utils/VncConsoleTypes';
import { sendCtrlAlt1, sendCtrlAlt2, sendPasteCMD } from './actions';

import './vnc-console.scss';

const { connected, connecting, disconnected } = ConsoleState;

export type StableVncConsoleProps = {
  basePath: string;
  /** A custom component to replace th default connect button screen */
  CustomConnectComponent?: FC<CustomConnectComponentProps>;
  /** Should console render alt tabs */
  hasGPU?: boolean;

  scaleViewport?: boolean;
  setActions: Dispatch<React.SetStateAction<AccessConsolesActions>>;
  setState: (state: ConsoleState) => void;
  viewOnly?: boolean;
};

export const StableVncConsole: FC<StableVncConsoleProps> = ({
  basePath,
  scaleViewport = true,
  setActions,
  setState,
  viewOnly = false,
}) => {
  const [rfb, setRfb] = useState<RFBCreate>(null);
  const staticRenderLocationRef = useRef(null);
  const sessionRef = useRef(0);

  const postDisconnectCleanup = useCallback(() => {
    setState(disconnected);
    setActions((actions) => (actions.type === VNC_CONSOLE_TYPE ? {} : actions));
    setRfb(null);
  }, [setState, setActions]);

  const disconnect = useCallback(() => {
    if (!rfb) {
      return;
    }
    rfb.disconnect();
    postDisconnectCleanup();
    //setters are stable because they come from useState hook
  }, [rfb, postDisconnectCleanup]);

  // eslint-disable-next-line no-console
  console.log('Foo:render');

  const connect = useCallback(() => {
    setState(connecting);
    const sessionID = ++sessionRef.current;

    // eslint-disable-next-line no-console
    console.log('Foo:Connect', sessionID, sessionRef.current);

    const isEncrypted = isConnectionEncrypted();
    const path = `${basePath}/vnc`;
    const port = window.location.port || (isEncrypted ? SECURE : INSECURE);
    const url = `${isEncrypted ? WSS : WS}://${window.location.hostname}:${port}/${path}`;
    const rfbInst = new RFBCreate(staticRenderLocationRef.current, url);
    rfbInst.addEventListener(
      'connect',
      () => sessionID === sessionRef.current && setState(connected),
    );
    rfbInst.addEventListener('disconnect', () => {
      // prevent disconnect for old session to interact with current connection attempt

      // eslint-disable-next-line no-console
      console.log('Foo:Event:disconnect', sessionID, sessionRef.current);

      sessionID === sessionRef.current && postDisconnectCleanup();
    });
    rfbInst.viewOnly = viewOnly;
    rfbInst.scaleViewport = scaleViewport;

    setRfb(rfbInst);
  }, [basePath, viewOnly, scaleViewport, setRfb, setState, postDisconnectCleanup]);

  useEffect(() => {
    if (!rfb) {
      try {
        initLogging('debug');
        connect();
      } catch (e) {
        kubevirtConsole.error(e);
      }
    } else {
      setActions({
        connect,
        disconnect,
        sendCtrlAlt1: sendCtrlAlt1.bind(rfb),
        sendCtrlAlt2: sendCtrlAlt2.bind(rfb),
        sendCtrlAltDel: rfb.sendCtrlAltDel?.bind(rfb),
        sendPaste: sendPasteCMD.bind(rfb),
        type: VNC_CONSOLE_TYPE,
      });
    }

    return () => {
      if (rfb) {
        disconnect();
      }
    };
  }, [disconnect, connect, rfb, setActions]);

  return <div className={'vnc-container'} ref={staticRenderLocationRef} />;
};

export default memo(StableVncConsole);
