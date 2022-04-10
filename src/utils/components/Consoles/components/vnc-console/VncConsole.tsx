import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import RFBCreate from '@novnc/novnc/core/rfb';
import { initLogging } from '@novnc/novnc/core/util/logging';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Spinner,
} from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Consoles/VncConsole';

import { ConsoleState, WS, WSS } from '../utils/ConsoleConsts';

import { VncConsoleProps } from './utils/VncConsoleTypes';
import VncConsoleActions from './VncConsoleActions';

import '@patternfly/react-styles/css/components/Consoles/VncConsole.css';

const { connected, connecting, disconnected } = ConsoleState;

export const VncConsole: React.FC<VncConsoleProps> = ({
  children,
  host,
  port = '80',
  path = '',
  encrypt = false,
  resizeSession = true,
  scaleViewport = false,
  viewOnly = false,
  shared = false,
  credentials,
  repeaterID = '',
  vncLogging = 'warn',
  consoleContainerId,
  additionalButtons = [] as React.ReactNode[],
  onDisconnected = () => null,
  onInitFailed,
  onSecurityFailure,
  textConnect,
  textConnecting,
  textDisconnected,
  textDisconnect,
  textSendShortcut,
  textCtrlAltDel,
}) => {
  const { t } = useKubevirtTranslation();
  const [rfb, setRfb] = React.useState<any>();
  const [status, setStatus] = React.useState<ConsoleState>(disconnected);
  const staticRenderLocaitonRef = React.useRef(null);
  const StaticRenderLocaiton = React.useMemo(
    () => <div id={consoleContainerId} ref={staticRenderLocaitonRef} />,
    [staticRenderLocaitonRef, consoleContainerId],
  );

  const url = React.useMemo(
    () => `${encrypt ? WSS : WS}://${host}:${port}/${path}`,
    [encrypt, host, path, port],
  );

  const options = React.useMemo(
    () => ({
      repeaterID,
      shared,
      credentials,
    }),
    [repeaterID, shared, credentials],
  );

  const connect = React.useCallback(() => {
    setStatus(connecting);
    setRfb(() => {
      const rfbInstnce = new RFBCreate(staticRenderLocaitonRef.current, url, options);
      rfbInstnce?.addEventListener('connect', () => setStatus(connected));
      rfbInstnce?.addEventListener('disconnect', (e: any) => {
        setStatus(disconnected);
        onDisconnected(e);
      });
      rfbInstnce?.addEventListener('securityfailure', (e: any) => {
        setStatus(disconnected);
        onSecurityFailure(e);
      });
      rfbInstnce.viewOnly = viewOnly;
      rfbInstnce.scaleViewport = scaleViewport;
      rfbInstnce.resizeSession = resizeSession;
      return rfbInstnce;
    });
  }, [
    url,
    options,
    staticRenderLocaitonRef,
    resizeSession,
    scaleViewport,
    viewOnly,
    onDisconnected,
    onSecurityFailure,
  ]);

  React.useEffect(() => {
    if (!rfb && status === disconnected) {
      try {
        initLogging(vncLogging);
        connect();
      } catch (e) {
        onInitFailed && onInitFailed(e);
      }
    }

    return () => {
      if (rfb && status === connected) {
        rfb?.disconnect();
      }
    };
  }, [connect, onInitFailed, vncLogging, rfb, status]);

  return (
    <>
      {status === connected && (
        <VncConsoleActions
          onCtrlAltDel={() => rfb?.sendCtrlAltDel()}
          textSendShortcut={textSendShortcut}
          textCtrlAltDel={textCtrlAltDel}
          textDisconnect={textDisconnect}
          onDisconnect={() => rfb?.disconnect()}
          additionalButtons={additionalButtons}
        />
      )}
      <div className={css(styles.consoleVnc)}>
        {children}
        <div>
          {status === disconnected && (
            <EmptyState>
              <EmptyStateBody>
                {textDisconnected || t('Click Connect to open the VNC console.')}
              </EmptyStateBody>
              <Button variant="primary" onClick={connect}>
                {textConnect || t('Connect')}
              </Button>
            </EmptyState>
          )}
          {status === connecting && (
            <EmptyState>
              <EmptyStateIcon variant="container" component={Spinner} />
              <EmptyStateBody>{textConnecting || t('Connecting')}</EmptyStateBody>
            </EmptyState>
          )}
          {StaticRenderLocaiton}
        </div>
      </div>
    </>
  );
};

export default VncConsole;
