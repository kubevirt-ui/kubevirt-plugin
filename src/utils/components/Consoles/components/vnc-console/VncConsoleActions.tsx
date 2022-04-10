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
  textCtrlAltDel,
  textDisconnect,
  onCtrlAltDel = undefined,
  onDisconnect,
  additionalButtons = [],
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
        dropdownItems={[
          <DropdownItem onClick={onCtrlAltDel} key="ctrl-alt-delete">
            {textCtrlAltDel || t('Ctrl+Alt+Del')}
          </DropdownItem>,
        ]}
      />
      <Button variant={ButtonVariant.secondary} onClick={onDisconnect}>
        {textDisconnect || t('Disconnect')}
      </Button>
    </div>
  );

  return toolbar;
};

export default VncConsoleActions;
