import React, { FC, memo, useCallback, useEffect, useRef, useState } from 'react';

import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import RFBCreate from '@novnc/novnc/lib/rfb';
import { initLogging } from '@novnc/novnc/lib/util/logging';

import { INSECURE, SECURE } from '../../utils/constants';
import { isConnectionEncrypted } from '../../utils/utils';
import { AccessConsolesActions } from '../AccessConsoles/utils/accessConsoles';
import { ConsoleState, WS, WSS } from '../utils/ConsoleConsts';

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
  setActions: (actions: AccessConsolesActions) => void;
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

  const disconnect = useCallback(() => {
    if (!rfb) {
      return;
    }
    rfb.disconnect();
    setState(disconnected);
    setActions({});
    setRfb(null);
    //setters are stable because they come from useState hook
  }, [rfb, setState, setActions]);

  const connect = useCallback(() => {
    setState(connecting);
    const isEncrypted = isConnectionEncrypted();
    const path = `${basePath}/vnc`;
    const port = window.location.port || (isEncrypted ? SECURE : INSECURE);
    const url = `${isEncrypted ? WSS : WS}://${window.location.hostname}:${port}/${path}`;
    const rfbInst = new RFBCreate(staticRenderLocationRef.current, url);
    rfbInst.addEventListener('connect', () => setState(connected));
    rfbInst.addEventListener('disconnect', () => {
      setState(disconnected);
    });
    rfbInst.addEventListener('securityfailure', () => {
      setState(disconnected);
    });
    rfbInst.viewOnly = viewOnly;
    rfbInst.scaleViewport = scaleViewport;

    setRfb(rfbInst);
  }, [basePath, viewOnly, scaleViewport, setRfb, setState]);

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
