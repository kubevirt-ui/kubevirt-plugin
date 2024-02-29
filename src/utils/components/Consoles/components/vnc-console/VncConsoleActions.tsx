import React, { FC, useState } from 'react';

import DropdownToggle from '@kubevirt-utils/components/toggles/DropdownToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownList,
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

  const onToggle = () => setIsOpen((prevIsOpen) => !prevIsOpen);

  return (
    <>
      <div className={css(styles.consoleActionsVnc)}>
        {additionalButtons}
        <Dropdown
          toggle={DropdownToggle({
            children: <>{textSendShortcut || t('Send key')}</>,
            id: 'pf-c-console__actions-vnc-toggle-id',
            isExpanded: isOpen,
            onClick: onToggle,
          })}
          isOpen={isOpen}
          onOpenChange={(open: boolean) => setIsOpen(open)}
          onSelect={() => setIsOpen(false)}
        >
          <DropdownList>
            {customButtons?.map(({ onClick, text }) => (
              <DropdownItem key={text} onClick={onClick}>
                {text}
              </DropdownItem>
            ))}
          </DropdownList>
        </Dropdown>
        <Button
          icon={
            <span>
              <PasteIcon /> {t('Paste')}
            </span>
          }
          className="vnc-paste-button"
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
