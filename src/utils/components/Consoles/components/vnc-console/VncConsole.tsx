import React, { FC, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cn from 'classnames';

import LoadingEmptyState from '@kubevirt-utils/components/LoadingEmptyState/LoadingEmptyState';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import KeyTable from '@novnc/novnc/core/input/keysym';
import RFBCreate from '@novnc/novnc/core/rfb';
import { initLogging } from '@novnc/novnc/core/util/logging';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  Tab,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Consoles/VncConsole';

import { ConsoleState, WS, WSS } from '../utils/ConsoleConsts';

import { isShiftKeyRequired } from './utils/util';
import { VncConsoleProps } from './utils/VncConsoleTypes';
import VncConsoleActions from './VncConsoleActions';

import '@patternfly/react-styles/css/components/Consoles/VncConsole.css';
import './vnc-console.scss';

const { connected, connecting, disconnected } = ConsoleState;

export const VncConsole: FC<VncConsoleProps> = ({
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
  showAccessControls = true,
  additionalButtons = [] as ReactNode[],
  onDisconnected,
  onInitFailed,
  onSecurityFailure,
  textConnect,
  textConnecting,
  textDisconnected,
  textDisconnect,
  textSendShortcut,
  textCtrlAltDel,
  autoConnect = true,
  CustomConnectComponent,
  CustomDisabledComponent,
  hasGPU,
  disabled,
}) => {
  const { t } = useKubevirtTranslation();
  const [rfb, setRfb] = useState<any>();
  const [status, setStatus] = useState<ConsoleState>(disconnected);
  const [activeTabKey, setActiveTabKey] = useState<number | string>(0);
  const staticRenderLocaitonRef = useRef(null);
  const StaticRenderLocaiton = useMemo(
    () => (
      <div
        className={cn('vnc-container', { hide: status !== connected })}
        id={consoleContainerId}
        ref={staticRenderLocaitonRef}
      ></div>
    ),
    [staticRenderLocaitonRef, consoleContainerId, status],
  );

  const url = useMemo(
    () => `${encrypt ? WSS : WS}://${host}:${port}/${path}`,
    [encrypt, host, path, port],
  );

  const options = useMemo(
    () => ({
      repeaterID,
      shared,
      credentials,
    }),
    [repeaterID, shared, credentials],
  );

  const connect = useCallback(() => {
    if (!disabled) {
      setStatus(connecting);
      setRfb(() => {
        const rfbInstnce = new RFBCreate(staticRenderLocaitonRef.current, url, options);
        rfbInstnce?.addEventListener('connect', () => setStatus(connected));
        rfbInstnce?.addEventListener('disconnect', (e: any) => {
          setStatus(disconnected);
          onDisconnected && onDisconnected(e);
        });
        rfbInstnce?.addEventListener('securityfailure', (e: any) => {
          setStatus(disconnected);
          onSecurityFailure && onSecurityFailure(e);
        });
        rfbInstnce.sendCtrlAlt1 = function sendCtrlAlt1() {
          if (this._rfbConnectionState !== connected || this._viewOnly) {
            return;
          }
          this.sendKey(KeyTable.XK_Control_L, 'ControlLeft', true);
          this.sendKey(KeyTable.XK_Alt_L, 'AltLeft', true);
          this.sendKey(KeyTable.XK_1, 'One', true);
          this.sendKey(KeyTable.XK_1, 'One', false);
          this.sendKey(KeyTable.XK_Alt_L, 'AltLeft', false);
          this.sendKey(KeyTable.XK_Control_L, 'ControlLeft', false);
        };
        rfbInstnce.sendCtrlAlt2 = function sendCtrlAlt2() {
          if (this._rfbConnectionState !== connected || this._viewOnly) {
            return;
          }
          this.sendKey(KeyTable.XK_Control_L, 'ControlLeft', true);
          this.sendKey(KeyTable.XK_Alt_L, 'AltLeft', true);
          this.sendKey(KeyTable.XK_2, 'Two', true);
          this.sendKey(KeyTable.XK_2, 'Two', false);
          this.sendKey(KeyTable.XK_Alt_L, 'AltLeft', false);
          this.sendKey(KeyTable.XK_Control_L, 'ControlLeft', false);
        };
        rfbInstnce.sendPasteCMD = async function sendPasteCMD() {
          if (this._rfbConnectionState !== connected || this._viewOnly) {
            return;
          }
          const clipboardText = await navigator?.clipboard?.readText?.();

          [...clipboardText].map((char) => {
            const shiftRequired = isShiftKeyRequired(char);

            shiftRequired && this.sendKey(KeyTable.XK_Shift_L, 'ShiftLeft', true);
            this.sendKey(char.charCodeAt(0));
            shiftRequired && this.sendKey(KeyTable.XK_Shift_L, 'ShiftLeft', false);
          });
          this.sendKey(KeyTable.XK_KP_Enter);
        };
        rfbInstnce.viewOnly = viewOnly;
        rfbInstnce.scaleViewport = scaleViewport;
        rfbInstnce.resizeSession = resizeSession;
        return rfbInstnce;
      });
    }
  }, [
    url,
    options,
    viewOnly,
    scaleViewport,
    resizeSession,
    onDisconnected,
    onSecurityFailure,
    disabled,
  ]);

  useEffect(() => {
    if (!rfb && status === disconnected) {
      try {
        initLogging(vncLogging);
        autoConnect && connect();
      } catch (e) {
        onInitFailed && onInitFailed(e);
      }
    }

    return () => {
      if (rfb && status === connected) {
        rfb?.disconnect();
      }
    };
  }, [connect, onInitFailed, vncLogging, rfb, status, autoConnect]);

  if (disabled) {
    return (
      <EmptyState className={css(styles.consoleVnc)}>
        <EmptyStateBody>{CustomDisabledComponent || t('Console is disabled')}</EmptyStateBody>
      </EmptyState>
    );
  }

  return (
    <>
      {status === connected && showAccessControls && (
        <VncConsoleActions
          customButtons={[
            {
              text: textCtrlAltDel || 'Ctrl + Alt + Delete',
              onClick: () => rfb?.sendCtrlAltDel(),
            },
            {
              text: 'Ctrl + Alt + 1',
              onClick: () => rfb?.sendCtrlAlt1(),
            },
            {
              text: 'Ctrl + Alt + 2',
              onClick: () => rfb?.sendCtrlAlt2(),
            },
          ]}
          textSendShortcut={textSendShortcut}
          textDisconnect={textDisconnect}
          onDisconnect={() => rfb?.disconnect()}
          additionalButtons={additionalButtons}
          onInjectTextFromClipboard={() => rfb?.sendPasteCMD()}
        />
      )}
      <div className={css(styles.consoleVnc)}>
        {children}
        {status === disconnected &&
          (CustomConnectComponent ? (
            <CustomConnectComponent connect={connect} />
          ) : (
            <EmptyState>
              <EmptyStateBody>
                {textDisconnected || t('Click Connect to open the VNC console.')}
              </EmptyStateBody>
              <Button variant="primary" onClick={connect}>
                {textConnect || t('Connect')}
              </Button>
            </EmptyState>
          ))}
        {status === connecting && (
          <LoadingEmptyState bodyContents={textConnecting || t('Connecting')} />
        )}

        {hasGPU && status === connected && (
          <div className="vnc-screen-tabs">
            <Tabs
              activeKey={activeTabKey}
              style={{
                width: staticRenderLocaitonRef?.current?.lastElementChild?.lastElementChild?.width,
              }}
            >
              <Tab
                eventKey={0}
                title={<TabTitleText>{t('Screen 1')}</TabTitleText>}
                onClick={() => {
                  rfb?.sendCtrlAlt1();
                  setActiveTabKey(0);
                }}
              />
              <Tab
                eventKey={1}
                title={<TabTitleText>{t('Screen 2')}</TabTitleText>}
                onClick={() => {
                  rfb?.sendCtrlAlt2();
                  setActiveTabKey(1);
                }}
              />
            </Tabs>
          </div>
        )}
        {StaticRenderLocaiton}
      </div>
    </>
  );
};

export default VncConsole;
