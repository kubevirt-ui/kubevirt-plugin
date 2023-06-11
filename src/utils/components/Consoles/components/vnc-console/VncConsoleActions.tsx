import React, { FC, useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownToggle,
} from '@patternfly/react-core';
import { PasteIcon } from '@patternfly/react-icons';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Consoles/VncConsole';

import { VncConsoleActionsProps } from './utils/VncConsoleTypes';

export const VncConsoleActions: FC<VncConsoleActionsProps> = ({
  additionalButtons = [],
  customButtons,
  onDisconnect,
  onInjectTextFromClipboard,
  textDisconnect,
  textSendShortcut,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className={css(styles.consoleActionsVnc)}>
        {additionalButtons}
        <Dropdown
          dropdownItems={customButtons?.map(({ onClick, text }) => (
            <DropdownItem key={text} onClick={onClick}>
              {text}
            </DropdownItem>
          ))}
          toggle={
            <DropdownToggle
              id="pf-c-console__actions-vnc-toggle-id"
              onToggle={() => setIsOpen(!isOpen)}
            >
              {textSendShortcut || t('Send key')}
            </DropdownToggle>
          }
          isOpen={isOpen}
          onSelect={() => setIsOpen(false)}
        />
        <Button
          icon={
            <span>
              <PasteIcon /> {t('Paste')}
            </span>
          }
          onClick={onInjectTextFromClipboard}
          variant={ButtonVariant.link}
        />
      </div>
      <Button
        className="vnc-actions-disconnect-button"
        onClick={onDisconnect}
        variant={ButtonVariant.secondary}
      >
        {textDisconnect || t('Disconnect')}
      </Button>
    </>
  );
};

export default VncConsoleActions;
