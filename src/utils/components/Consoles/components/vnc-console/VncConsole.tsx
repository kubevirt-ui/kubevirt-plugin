import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import cn from 'classnames';
import {
  CharMappingWithModifiers,
  KeyboardLayout,
  KeyMapDef,
  keyMaps,
  resolveCharMapping,
} from 'vnc-keymaps';

import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import KeyTable from '@novnc/novnc/lib/input/keysym';
import RFBCreate from '@novnc/novnc/lib/rfb';
import { initLogging } from '@novnc/novnc/lib/util/logging';
import { Tab, Tabs, TabTitleText } from '@patternfly/react-core';

import { INSECURE, SECURE } from '../../utils/constants';
import { isConnectionEncrypted, sleep } from '../../utils/utils';
import { ConsoleState, WS, WSS } from '../utils/ConsoleConsts';
import useCopyPasteConsole from '../utils/hooks/useCopyPasteConsole';

import { VncConsoleProps } from './utils/VncConsoleTypes';
import UnsupportedCharModal from './UnsupportedCharModal';
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
  const { createModal } = useModal();
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
      rfbInstnce.sendPasteCMD = async function sendPasteCMD(selectedKeyboard: KeyboardLayout) {
        if (this._rfbConnectionState !== connected || this._viewOnly) {
          return;
        }
        const clipboardText = await navigator?.clipboard?.readText?.();
        const text = clipboardText || pasteText.current;
        const keyMap: KeyMapDef = keyMaps[selectedKeyboard];
        const mappedChars: CharMappingWithModifiers[] = [...text].map((codePoint) =>
          resolveCharMapping(codePoint, keyMap.map),
        );

        const unsupportedChars = mappedChars.filter(({ mapping }) => mapping.scanCode === 0);
        if (unsupportedChars.length) {
          createModal((props) => (
            <UnsupportedCharModal
              {...props}
              unsupportedChars={Array.from(
                new Set(unsupportedChars.map(({ mapping }) => mapping.char ?? '<unknown>')),
              )}
            />
          ));
          return;
        }

        for (const toType of mappedChars) {
          const { keysym, scanCode } = toType.mapping;

          // qemu maintains virtual keyboard state (caps lock, shift, etc)
          // keysyms are checked against that state and lower case version will be picked
          // if there is no shift/caps lock turn on
          for (const modifier of toType.modifiers) {
            RFBCreate.messages.QEMUExtendedKeyEvent(
              this._sock,
              modifier.keysym,
              true,
              modifier.scanCode,
            );
            await sleep(50);
          }

          RFBCreate.messages.QEMUExtendedKeyEvent(this._sock, keysym, true, scanCode);
          // long text is getting truncated without a delay
          await sleep(50);

          for (const modifier of toType.modifiers) {
            RFBCreate.messages.QEMUExtendedKeyEvent(
              this._sock,
              modifier.keysym,
              false,
              modifier.scanCode,
            );
            await sleep(50);
          }
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
    createModal,
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
