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
  textSendShortcut,
  textDisconnect,
  onDisconnect,
  additionalButtons = [],
  customButtons,
  onInjectTextFromClipboard,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className={css(styles.consoleActionsVnc)}>
        {additionalButtons}
        <Dropdown
          onSelect={() => setIsOpen(false)}
          toggle={
            <DropdownToggle
              id="pf-c-console__actions-vnc-toggle-id"
              onToggle={() => setIsOpen(!isOpen)}
            >
              {textSendShortcut || t('Send key')}
            </DropdownToggle>
          }
          isOpen={isOpen}
          dropdownItems={customButtons?.map(({ onClick, text }) => (
            <DropdownItem onClick={onClick} key={text}>
              {text}
            </DropdownItem>
          ))}
        />
        <Button
          variant={ButtonVariant.link}
          onClick={onInjectTextFromClipboard}
          icon={
            <span>
              <PasteIcon /> {t('Paste')}
            </span>
          }
        />
      </div>
      <Button
        variant={ButtonVariant.secondary}
        onClick={onDisconnect}
        className="vnc-actions-disconnect-button"
      >
        {textDisconnect || t('Disconnect')}
      </Button>
    </>
  );
};

export default VncConsoleActions;
