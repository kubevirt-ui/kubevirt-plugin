import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cn from 'classnames';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import KeyTable from '@novnc/novnc/lib/input/keysym';
import RFBCreate from '@novnc/novnc/lib/rfb';
import { initLogging } from '@novnc/novnc/lib/util/logging';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';
import { useFleetK8sAPIPath } from '@stolostron/multicluster-sdk';

import { INSECURE, SECURE } from '../../utils/constants';
import { isConnectionEncrypted, sleep } from '../../utils/utils';
import { ConsoleState, WS, WSS } from '../utils/ConsoleConsts';
import useCopyPasteConsole from '../utils/hooks/useCopyPasteConsole';

import {
  HORIZONTAL_TAB,
  isShiftKeyRequired,
  LATIN_1_FIRST_CHAR,
  LATIN_1_LAST_CHAR,
  LINE_FEED,
} from './utils/util';
import { VncConsoleProps } from './utils/VncConsoleTypes';
import VncConnect from './VncConnect';

import './vnc-console.scss';

const { connected, connecting, disconnected } = ConsoleState;

export const VncConsole: FC<VncConsoleProps> = ({
  CustomConnectComponent = VncConnect,
  hasGPU,
  onConnect,
  scaleViewport = true,
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
  const [k8sAPIPath, k8sApiPathLoaded] = useFleetK8sAPIPath(vmi.cluster);

  const connect = useCallback(() => {
    setStatus(connecting);
    setRfb(() => {
      const isEncrypted = isConnectionEncrypted();
      const path = `${k8sAPIPath}/apis/subresources.kubevirt.io/v1/namespaces/${vmi?.metadata?.namespace}/virtualmachineinstances/${vmi?.metadata?.name}/vnc`;
      const port = window.location.port || (isEncrypted ? SECURE : INSECURE);
      const url = `${isEncrypted ? WSS : WS}://${window.location.hostname}:${port}${path}`;
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
        for (const codePoint of text) {
          const codePointIndex = codePoint.codePointAt(0);
          if (codePointIndex === LINE_FEED) {
            this.sendKey(KeyTable.XK_Return);
          } else if (codePointIndex === HORIZONTAL_TAB) {
            this.sendKey(KeyTable.XK_Tab);
          } else if (codePointIndex >= LATIN_1_FIRST_CHAR && codePointIndex <= LATIN_1_LAST_CHAR) {
            // qemu maintains virtual keyboard state (caps lock, shift, etc)
            // keysyms are checked against that state and lower case version will be picked
            // if there is no shift/caps lock turn on
            const shiftRequired = isShiftKeyRequired(codePoint);
            shiftRequired && this.sendKey(KeyTable.XK_Shift_L, 'ShiftLeft', true);
            // long text is getting truncated without a delay
            await sleep(50);
            // Latin-1 set that maps directly to keysym
            this.sendKey(codePointIndex);
            shiftRequired && this.sendKey(KeyTable.XK_Shift_L, 'ShiftLeft', false);
          }
        }
      };
      rfbInstnce.viewOnly = viewOnly;
      rfbInstnce.scaleViewport = scaleViewport;
      onConnect?.(rfbInstnce);
      return rfbInstnce;
    });
  }, [
    k8sAPIPath,
    vmi?.metadata?.namespace,
    vmi?.metadata?.name,
    viewOnly,
    scaleViewport,
    onConnect,
    pasteText,
  ]);

  useEffect(() => {
    if (!k8sApiPathLoaded) return;
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
  }, [onConnect, connect, rfb, status, k8sApiPathLoaded]);

  return (
    <>
      {(status === disconnected || status === connecting) && (
        <CustomConnectComponent connect={connect} isConnecting={status === connecting} />
      )}

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
    </>
  );
};

export default VncConsole;
