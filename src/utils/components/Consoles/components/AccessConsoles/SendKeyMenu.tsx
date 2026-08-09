import React, { type FC, type RefObject } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Icon,
  Menu,
  MenuContent,
  MenuItem,
  MenuList,
  Popper,
  Tooltip,
} from '@patternfly/react-core';
import { HelpIcon } from '@patternfly/react-icons';

type SendKeyMenuItem = { onClick: () => void; text: string };

type SendKeyMenuProps = {
  functionKeyItems: SendKeyMenuItem[];
  isOpen: boolean;
  mainMenuItems: SendKeyMenuItem[];
  menuRef: RefObject<HTMLDivElement>;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement>;
};

const SendKeyMenu: FC<SendKeyMenuProps> = ({
  functionKeyItems,
  isOpen,
  mainMenuItems,
  menuRef,
  onClose,
  triggerRef,
}) => {
  const { t } = useKubevirtTranslation();

  return (
    <Popper
      isVisible={isOpen}
      popper={
        <Menu containsFlyout ref={menuRef}>
          <MenuContent>
            <div className="send-key-menu-header">
              <span className="send-key-menu-header__title">{t('Key options')}</span>
              <Tooltip
                content={t('Send keyboard input directly to the VM, including special keys')}
              >
                <Icon size="sm">
                  <HelpIcon />
                </Icon>
              </Tooltip>
            </div>
            <MenuList>
              {mainMenuItems.map(({ onClick, text }) => (
                <MenuItem isDisabled={!onClick} key={text} onClick={onClick}>
                  {text}
                </MenuItem>
              ))}
              <MenuItem
                flyoutMenu={
                  <Menu className="function-keys-horizontal-flyout">
                    <MenuContent>
                      <MenuList>
                        {functionKeyItems.map(({ onClick, text }) => (
                          <MenuItem
                            key={text}
                            onClick={() => {
                              onClick();
                              onClose();
                            }}
                          >
                            {text}
                          </MenuItem>
                        ))}
                      </MenuList>
                    </MenuContent>
                  </Menu>
                }
              >
                {t('More key options')}
              </MenuItem>
            </MenuList>
          </MenuContent>
        </Menu>
      }
      triggerRef={triggerRef}
    />
  );
};

export default SendKeyMenu;
