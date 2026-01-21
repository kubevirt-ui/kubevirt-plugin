/* eslint-disable @typescript-eslint/no-shadow */
import React, { FC, MouseEvent, useRef, useState } from 'react';

import { KeyboardLayout } from '@kubevirt-ui-ext/vnc-keymaps';
import SelectToggle from '@kubevirt-utils/components/toggles/SelectToggle';
import { useClickOutside } from '@kubevirt-utils/hooks/useClickOutside/useClickOutside';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import {
  Button,
  ButtonVariant,
  Icon,
  Menu,
  MenuContent,
  MenuItem,
  MenuList,
  MenuToggle,
  Popper,
  Select,
  SelectList,
  SelectOption,
  Tooltip,
} from '@patternfly/react-core';
import { HelpIcon, PasteIcon } from '@patternfly/react-icons';

import { ConsoleState, isConsoleType, VNC_CONSOLE_TYPE } from '../utils/ConsoleConsts';

import { AccessConsolesProps, typeMap, useFavoriteKeymaps } from './utils/accessConsoles';
import { VncKeymapDropdown } from './VncKeymapDropdown';

import './access-consoles.scss';

const { connected } = ConsoleState;

export const AccessConsoles: FC<AccessConsolesProps> = ({
  actions,
  isWindowsVM,
  setType,
  state,
  type,
}) => {
  const [isOpenSelectType, setIsOpenSelectType] = useState<boolean>(false);
  const [isOpenSendKey, setIsOpenSendKey] = useState<boolean>(false);
  const { t } = useKubevirtTranslation();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { defaultKeyboard, favoriteKeymaps, updateFavorite } = useFavoriteKeymaps();
  const [selectedKeyboard, setSelectedKeyboard] = useState<KeyboardLayout>(defaultKeyboard);

  useClickOutside([menuRef, toggleRef], () => setIsOpenSendKey(false));

  const mainMenuItems = [
    {
      onClick: () => {
        actions.sendCtrlAltDel?.();
        setIsOpenSendKey(false);
      },
      text: 'Ctrl + Alt + Delete',
    },
    {
      onClick: () => {
        actions.sendCtrlAlt1?.();
        setIsOpenSendKey(false);
      },
      text: 'Ctrl + Alt + 1',
    },
    {
      onClick: () => {
        actions.sendCtrlAlt2?.();
        setIsOpenSendKey(false);
      },
      text: 'Ctrl + Alt + 2',
    },
  ];
  const functionKeyItems = [
    { onClick: () => actions.sendF1?.(), text: 'F1' },
    { onClick: () => actions.sendF2?.(), text: 'F2' },
    { onClick: () => actions.sendF3?.(), text: 'F3' },
    { onClick: () => actions.sendF4?.(), text: 'F4' },
    { onClick: () => actions.sendF5?.(), text: 'F5' },
    { onClick: () => actions.sendF6?.(), text: 'F6' },
    { onClick: () => actions.sendF7?.(), text: 'F7' },
    { onClick: () => actions.sendF8?.(), text: 'F8' },
    { onClick: () => actions.sendF9?.(), text: 'F9' },
    { onClick: () => actions.sendF10?.(), text: 'F10' },
    { onClick: () => actions.sendF11?.(), text: 'F11' },
    { onClick: () => actions.sendF12?.(), text: 'F12' },
  ];

  return (
    <>
      {type === VNC_CONSOLE_TYPE && (
        <VncKeymapDropdown
          actions={actions}
          {...{ favoriteKeymaps, selectedKeyboard, setSelectedKeyboard, updateFavorite }}
        />
      )}
      {type !== VNC_CONSOLE_TYPE && (
        <Button
          onClick={
            actions.sendPaste
              ? (e: MouseEvent<HTMLButtonElement>) => {
                  e?.currentTarget?.blur();
                  actions
                    .sendPaste({ shouldFocusOnConsole: true })
                    .catch((err) =>
                      kubevirtConsole.error('Failed to paste into Serial console', err),
                    );
                }
              : undefined
          }
          className="vnc-paste-button"
          icon={<PasteIcon />}
          isDisabled={!actions.sendPaste}
          variant={ButtonVariant.link}
        >
          {t('Paste to console')}
        </Button>
      )}
      <Select
        onSelect={(_, selection: string) => {
          isConsoleType(selection) && setType(selection);
          setIsOpenSelectType(false);
        }}
        toggle={SelectToggle({
          className: 'access-consoles-selector',
          id: 'pf-v6-c-console__type-selector',
          isExpanded: isOpenSelectType,
          onClick: () => setIsOpenSelectType((prevIsOpen) => !prevIsOpen),
          selected: type,
        })}
        aria-label={t('Select console type')}
        isOpen={isOpenSelectType}
        onOpenChange={setIsOpenSelectType}
        placeholder={t('Select console type')}
        selected={type}
      >
        <SelectList>
          {Object.entries(typeMap(isWindowsVM, t)).map(([type, label]) => {
            return (
              <SelectOption id={type} key={type} value={type}>
                {label}
              </SelectOption>
            );
          })}
        </SelectList>
      </Select>
      <MenuToggle
        className="access-consoles-selector"
        id="pf-v6-c-console__actions-vnc-toggle-id"
        isDisabled={type !== VNC_CONSOLE_TYPE}
        isExpanded={isOpenSendKey}
        onClick={() => setIsOpenSendKey((prevIsOpen) => !prevIsOpen)}
        ref={toggleRef}
      >
        {t('Send key')}
      </MenuToggle>
      <Popper
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
                              onClick={() => {
                                onClick();
                                setIsOpenSendKey(false);
                              }}
                              key={text}
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
        isVisible={isOpenSendKey}
        triggerRef={toggleRef}
      />
      <Button
        className="vnc-actions-disconnect-button"
        isDisabled={state !== connected || !actions.disconnect}
        onClick={actions.disconnect}
        variant={ButtonVariant.secondary}
      >
        {t('Disconnect')}
      </Button>
    </>
  );
};

AccessConsoles.displayName = 'AccessConsoles';
