/* eslint-disable @typescript-eslint/no-shadow */
import React, { type FC, type MouseEvent, useRef, useState } from 'react';

import { type KeyboardLayout } from '@kubevirt-ui-ext/vnc-keymaps';
import SelectToggle from '@kubevirt-utils/components/toggles/SelectToggle';
import { useClickOutside } from '@kubevirt-utils/hooks/useClickOutside/useClickOutside';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { kubevirtConsole } from '@kubevirt-utils/utils/utils';
import {
  Button,
  ButtonVariant,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { PasteIcon } from '@patternfly/react-icons';

import { ConsoleState, isConsoleType, VNC_CONSOLE_TYPE } from '../utils/ConsoleConsts';
import SendKeyMenu from './SendKeyMenu';
import { type AccessConsolesProps, typeMap, useFavoriteKeymaps } from './utils/accessConsoles';
import { getFunctionKeyItems, getMainMenuItems } from './utils/sendKeyMenuItems';
import { VncKeymapDropdown } from './VncKeymapDropdown';

import './access-consoles.scss';

const { Connected: connected } = ConsoleState;

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

  const closeMenu = (): void => setIsOpenSendKey(false);
  const mainMenuItems = getMainMenuItems(actions, closeMenu);
  const functionKeyItems = getFunctionKeyItems(actions);

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
          className="vnc-paste-button"
          icon={<PasteIcon />}
          isDisabled={!actions.sendPaste}
          onClick={
            actions.sendPaste
              ? (e: MouseEvent<HTMLButtonElement>): void => {
                  e?.currentTarget?.blur();
                  actions
                    .sendPaste({ shouldFocusOnConsole: true })
                    .catch((err) =>
                      kubevirtConsole.error('Failed to paste into Serial console', err),
                    );
                }
              : undefined
          }
          variant={ButtonVariant.link}
        >
          {t('Paste to console')}
        </Button>
      )}
      <Select
        aria-label={t('Select console type')}
        isOpen={isOpenSelectType}
        onOpenChange={setIsOpenSelectType}
        onSelect={(_event, selection: string) => {
          isConsoleType(selection) && setType(selection);
          setIsOpenSelectType(false);
        }}
        selected={type}
        toggle={SelectToggle({
          className: 'access-consoles-selector',
          id: 'pf-v6-c-console__type-selector',
          isExpanded: isOpenSelectType,
          onClick: () => setIsOpenSelectType((prevIsOpen) => !prevIsOpen),
          selected: type,
        })}
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
      <SendKeyMenu
        functionKeyItems={functionKeyItems}
        isOpen={isOpenSendKey}
        mainMenuItems={mainMenuItems}
        menuRef={menuRef}
        onClose={closeMenu}
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
