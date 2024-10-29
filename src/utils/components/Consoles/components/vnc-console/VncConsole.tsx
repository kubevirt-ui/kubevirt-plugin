import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cn from 'classnames';

import LoadingEmptyState from '@kubevirt-utils/components/LoadingEmptyState/LoadingEmptyState';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import KeyTable from '@novnc/novnc/core/input/keysym';
import RFBCreate from '@novnc/novnc/core/rfb';
import { initLogging } from '@novnc/novnc/core/util/logging';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
  Tab,
  Tabs,
  TabTitleText,
} from '@patternfly/react-core';

import { INSECURE, SECURE } from '../../utils/constants';
import { isConnectionEncrypted, sleep } from '../../utils/utils';
import { ConsoleState, WS, WSS } from '../utils/ConsoleConsts';
import useCopyPasteConsole from '../utils/hooks/useCopyPasteConsole';

import { isShiftKeyRequired } from './utils/util';
import { VncConsoleProps } from './utils/VncConsoleTypes';

import '@patternfly/react-styles/css/components/Consoles/VncConsole.css';
import './vnc-console.scss';

const { connected, connecting, disconnected } = ConsoleState;

export const VncConsole: FC<VncConsoleProps> = ({
  CustomConnectComponent,
  hasGPU,
  onConnect,
  scaleViewport = false,
  viewOnly = false,
  vmi,
}) => {
  const { t } = useKubevirtTranslation();
  const [rfb, setRfb] = useState<RFBCreate>();
  const [status, setStatus] = useState<ConsoleState>(disconnected);
  const [activeTabKey, setActiveTabKey] = useState<number | string>(0);
  const pasteText = useCopyPasteConsole();
  const staticRenderLocationRef = useRef(null);
  const StaticRenderLocation = useMemo(
    () => (
      <div
        className={cn('vnc-container', { hide: status !== connected })}
        ref={staticRenderLocationRef}
      />
    ),
    [staticRenderLocationRef, status],
  );

  const connect = useCallback(() => {
    setStatus(connecting);
    setRfb(() => {
      const isEncrypted = isConnectionEncrypted();
      const path = `api/kubernetes/apis/subresources.kubevirt.io/v1/namespaces/${vmi?.metadata?.namespace}/virtualmachineinstances/${vmi?.metadata?.name}/vnc`;
      const port = window.location.port || (isEncrypted ? SECURE : INSECURE);
      const url = `${isEncrypted ? WSS : WS}://${window.location.hostname}:${port}/${path}`;
      const rfbInstnce = new RFBCreate(staticRenderLocationRef.current, url);
      rfbInstnce?.addEventListener('connect', () => setStatus(connected));
      rfbInstnce?.addEventListener('disconnect', () => {
        setStatus(disconnected);
      });
      rfbInstnce?.addEventListener('securityfailure', () => {
        setStatus(disconnected);
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
        const text = clipboardText || pasteText.current;
        const lastItem = text.length - 1;
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          const shiftRequired = isShiftKeyRequired(char);
          await sleep(50);
          shiftRequired && this.sendKey(KeyTable.XK_Shift_L, 'ShiftLeft', true);
          this.sendKey(char.charCodeAt(0));
          shiftRequired && this.sendKey(KeyTable.XK_Shift_L, 'ShiftLeft', false);
          i === lastItem &&
            clipboardText?.charCodeAt(lastItem) === 13 &&
            this.sendKey(KeyTable.XK_KP_Enter);
        }
      };
      rfbInstnce.viewOnly = viewOnly;
      rfbInstnce.scaleViewport = scaleViewport;
      onConnect?.(rfbInstnce);
      return rfbInstnce;
    });
  }, [
    vmi?.metadata?.namespace,
    vmi?.metadata?.name,
    viewOnly,
    scaleViewport,
    onConnect,
    pasteText,
  ]);

  useEffect(() => {
    if (!rfb && status === disconnected) {
      try {
        initLogging('debug');
        connect();
      } catch (e) {
        kubevirtConsole.error(e);
      }
    }

    return () => {
      if (rfb && status === connected) {
        rfb?.disconnect();
        onConnect?.(null);
      }
    };
  }, [onConnect, connect, rfb, status]);

  return (
    <div className="pf-c-console__vnc">
      {status === disconnected &&
        (CustomConnectComponent ? (
          <CustomConnectComponent connect={connect} />
        ) : (
          <EmptyState>
            <EmptyStateBody>{t('Click Connect to open the VNC console.')}</EmptyStateBody>
            <EmptyStateFooter>
              <Button onClick={connect} variant="primary">
                {t('Connect')}
              </Button>
            </EmptyStateFooter>
          </EmptyState>
        ))}
      {status === connecting && <LoadingEmptyState bodyContents={t('Connecting')} />}

      {hasGPU && status === connected && (
        <div className="vnc-screen-tabs">
          <Tabs
            style={{
              width: staticRenderLocationRef?.current?.lastElementChild?.lastElementChild?.width,
            }}
            activeKey={activeTabKey}
          >
            <Tab
              onClick={() => {
                rfb?.sendCtrlAlt1();
                setActiveTabKey(0);
              }}
              eventKey={0}
              title={<TabTitleText>{t('Screen 1')}</TabTitleText>}
            />
            <Tab
              onClick={() => {
                rfb?.sendCtrlAlt2();
                setActiveTabKey(1);
              }}
              eventKey={1}
              title={<TabTitleText>{t('Screen 2')}</TabTitleText>}
            />
          </Tabs>
        </div>
      )}
      {StaticRenderLocation}
    </div>
  );
};

export default VncConsole;
