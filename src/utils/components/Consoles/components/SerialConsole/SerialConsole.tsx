import * as React from 'react';
import classNames from 'classnames';

import LoadingEmptyState from '@kubevirt-utils/components/LoadingEmptyState/LoadingEmptyState';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Button, ButtonVariant, EmptyState, EmptyStateBody } from '@patternfly/react-core';
import { PasteIcon } from '@patternfly/react-icons';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Consoles/SerialConsole';
import stylesVNC from '@patternfly/react-styles/css/components/Consoles/VncConsole';

import { ConsoleState } from '../utils/ConsoleConsts';

import { SerialConsoleProps } from './utils/serialConsole';
import { XTerm } from './Xterm/Xterm';
import { SerialConsoleActions } from './SerialConsoleActions';

import '@patternfly/react-styles/css/components/Consoles/xterm.css';
import '@patternfly/react-styles/css/components/Consoles/SerialConsole.css';
import './SerialConsole.scss';

const { connected, disconnected, loading } = ConsoleState;

const SerialConsole: React.FunctionComponent<SerialConsoleProps> = ({
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
  React.useEffect(() => {
    onConnect();
    return () => {
      onDisconnect();
    };
  }, [onConnect, onDisconnect]);

  const focusTerminal = () => {
    innerRef && innerRef.current && innerRef.current.focusTerminal();
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
    navigator.clipboard
      .readText()
      .then((clipboardText) => onData(clipboardText.concat(String.fromCharCode(13)))); // concat "Enter" key
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

export default React.forwardRef((props: SerialConsoleProps, ref: React.Ref<HTMLDivElement>) => (
  <SerialConsole innerRef={ref as React.MutableRefObject<any>} {...props} />
));
