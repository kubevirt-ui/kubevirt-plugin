import React, { forwardRef, FunctionComponent, MutableRefObject, Ref, useEffect } from 'react';
import classNames from 'classnames';

import LoadingEmptyState from '@kubevirt-utils/components/LoadingEmptyState/LoadingEmptyState';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, EmptyState, EmptyStateBody } from '@patternfly/react-core';
import { PasteIcon } from '@patternfly/react-icons';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Consoles/SerialConsole';
import stylesVNC from '@patternfly/react-styles/css/components/Consoles/VncConsole';

import { ConsoleState } from '../utils/ConsoleConsts';
import useCopyPasteConsole from '../utils/hooks/useCopyPasteConsole';

import { SerialConsoleProps } from './utils/serialConsole';
import { XTerm } from './Xterm/Xterm';
import { SerialConsoleActions } from './SerialConsoleActions';

import '@patternfly/react-styles/css/components/Consoles/xterm.css';
import '@patternfly/react-styles/css/components/Consoles/SerialConsole.css';
import './SerialConsole.scss';

const { connected, disconnected, loading } = ConsoleState;

const SerialConsole: FunctionComponent<SerialConsoleProps> = ({
  cols,
  fontFamily,
  fontSize,
  innerRef,
  onConnect,
  onData,
  onDisconnect,
  onTitleChanged = () => null,
  rows,
  status = loading,
  textConnect,
  textDisconnect,
  textDisconnected,
  textLoading,
  textReset,
}) => {
  const { t } = useKubevirtTranslation();
  const pasteText = useCopyPasteConsole();

  useEffect(() => {
    onConnect();
    return () => {
      onDisconnect();
    };
  }, [onConnect, onDisconnect]);

  const focusTerminal = () => {
    innerRef?.current?.focusTerminal();
  };

  const onConnectClick = () => {
    onConnect();
    focusTerminal();
  };

  const onDisconnectClick = () => {
    onDisconnect();
    focusTerminal();
  };

  const onResetClick = () => {
    onDisconnect();
    onConnect();
    focusTerminal();
  };

  const onClipboardPaste = () => {
    try {
      navigator.clipboard.readText().then((clipboardText) => onData(clipboardText));
    } catch {
      onData(pasteText?.current);
    }
  };

  let terminal = null;
  switch (status) {
    case connected:
      terminal = (
        <XTerm
          cols={cols}
          fontFamily={fontFamily}
          fontSize={fontSize}
          innerRef={innerRef}
          onData={onData}
          onTitleChanged={onTitleChanged}
          rows={rows}
        />
      );
      break;
    case disconnected:
      terminal = (
        <EmptyState>
          <EmptyStateBody>
            {textDisconnected || t('Click Connect to open serial console.')}
          </EmptyStateBody>
          <Button onClick={onConnectClick}>{textConnect || t('Connect')}</Button>
        </EmptyState>
      );
      break;
    case loading:
    default:
      terminal = <LoadingEmptyState bodyContents={textLoading} />;
      break;
  }

  return (
    <>
      <Button
        icon={
          <span>
            <PasteIcon /> {t('Paste')}
          </span>
        }
        // Using VNC styles to avoid code dupe for paste button
        className={classNames('paste-from-clipboard-btn', stylesVNC.consoleActionsVnc)}
        onClick={onClipboardPaste}
        variant={ButtonVariant.link}
      />
      {status !== disconnected && (
        <SerialConsoleActions
          onDisconnect={onDisconnectClick}
          onReset={onResetClick}
          textDisconnect={textDisconnect}
          textReset={textReset}
        />
      )}
      <div className={css(styles.consoleSerial)}>{terminal}</div>
    </>
  );
};

SerialConsole.displayName = 'SerialConsole';

export default forwardRef((props: SerialConsoleProps, ref: Ref<HTMLDivElement>) => (
  <SerialConsole innerRef={ref as MutableRefObject<any>} {...props} />
));
