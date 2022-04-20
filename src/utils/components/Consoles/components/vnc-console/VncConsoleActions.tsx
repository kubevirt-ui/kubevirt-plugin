import * as React from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownToggle,
} from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Consoles/VncConsole';

import { VncConsoleActionsProps } from './utils/VncConsoleTypes';

export const VncConsoleActions: React.FC<VncConsoleActionsProps> = ({
  textSendShortcut,
  textDisconnect,
  onDisconnect,
  additionalButtons = [],
  customButtons,
}) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const toolbar = (
    <div className={css(styles.consoleActionsVnc)}>
      {additionalButtons}
      <Dropdown
        id="pf-c-console__send-shortcut"
        onSelect={() => setIsOpen(false)}
        toggle={
          <DropdownToggle
            id="pf-c-console__actions-vnc-toggle-id"
            onToggle={() => setIsOpen(!isOpen)}
          >
            {textSendShortcut || t('Send Key')}
          </DropdownToggle>
        }
        isOpen={isOpen}
        dropdownItems={customButtons?.map(({ onClick, text }) => (
          <DropdownItem onClick={onClick} key={text}>
            {text}
          </DropdownItem>
        ))}
      />
      <Button variant={ButtonVariant.secondary} onClick={onDisconnect}>
        {textDisconnect || t('Disconnect')}
      </Button>
    </div>
  );

  return toolbar;
};

export default VncConsoleActions;
