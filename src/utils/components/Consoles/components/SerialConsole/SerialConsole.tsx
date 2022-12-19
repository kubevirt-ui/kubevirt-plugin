import * as React from 'react';
import classNames from 'classnames';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Spinner,
} from '@patternfly/react-core';
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
  onConnect,
  onDisconnect,
  onTitleChanged = () => null,
  onData,
  cols,
  rows,
  fontFamily,
  fontSize,
  status = loading,
  textConnect,
  textDisconnect,
  textReset,
  textDisconnected,
  textLoading,
  innerRef,
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
          innerRef={innerRef}
          cols={cols}
          rows={rows}
          fontFamily={fontFamily}
          fontSize={fontSize}
          onTitleChanged={onTitleChanged}
          onData={onData}
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
      terminal = (
        <EmptyState>
          <EmptyStateIcon variant="container" component={Spinner} />
          <EmptyStateBody>{textLoading || t('Loading ...')}</EmptyStateBody>
        </EmptyState>
      );
      break;
  }

  return (
    <>
      <Button
        // Using VNC styles to avoid code dupe for paste button
        className={classNames('paste-from-clipboard-btn', stylesVNC.consoleActionsVnc)}
        variant={ButtonVariant.link}
        onClick={onClipboardPaste}
        icon={
          <span>
            <PasteIcon /> {t('Paste')}
          </span>
        }
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
