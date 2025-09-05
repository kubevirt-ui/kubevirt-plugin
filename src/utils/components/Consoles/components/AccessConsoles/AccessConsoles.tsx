/* eslint-disable @typescript-eslint/no-shadow */
import React, { FC, MouseEvent, Ref, useState } from 'react';

import { isKeyboardLayout, KeyboardLayout, keyMaps } from '@kubevirt-ui/vnc-keymaps';
import { useModal } from '@kubevirt-utils/components/ModalProvider/ModalProvider';
import DropdownToggle from '@kubevirt-utils/components/toggles/DropdownToggle';
import SelectToggle from '@kubevirt-utils/components/toggles/SelectToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  Divider,
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleAction,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { PasteIcon } from '@patternfly/react-icons';

import { ConsoleState, isConsoleType, VNC_CONSOLE_TYPE } from '../utils/ConsoleConsts';

import { AccessConsolesProps, typeMap } from './utils/accessConsoles';

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
  const defaultKeyboard: KeyboardLayout = 'en-us';
  const [selectedKeyboard, setSelectedKeyboard] = useState<KeyboardLayout>(defaultKeyboard);
  const [isKeyboardSelectOpen, setIsKeyboardSelectOpen] = useState<boolean>(false);
  const { createModal } = useModal();

  const customButtons = [
    {
      onClick: () => actions.sendCtrlAltDel?.(),
      text: 'Ctrl + Alt + Delete',
    },
    {
      onClick: () => actions.sendCtrlAlt1?.(),
      text: 'Ctrl + Alt + 1',
    },
    {
      onClick: () => actions.sendCtrlAlt2?.(),
      text: 'Ctrl + Alt + 2',
    },
  ];
  const typeInLabel = t('Paste to console');
  return (
    <>
      {type === VNC_CONSOLE_TYPE && (
        <Dropdown
          onSelect={(_event, value?: number | string) => {
            isKeyboardLayout(value) && setSelectedKeyboard(value);
            setIsKeyboardSelectOpen(false);
          }}
          toggle={(toggleRef: Ref<MenuToggleElement>) => (
            <MenuToggle
              splitButtonItems={[
                <MenuToggleAction
                  onClick={
                    actions.sendPaste
                      ? (e: MouseEvent<HTMLButtonElement>) => {
                          e?.currentTarget?.blur();
                          actions
                            .sendPaste({
                              createModal,
                              selectedKeyboard,
                              shouldFocusOnConsole: true,
                            })
                            // eslint-disable-next-line no-console
                            .catch((err) => console.error('Failed to paste into VNC console', err));
                        }
                      : undefined
                  }
                  aria-label={typeInLabel}
                  key={typeInLabel}
                >
                  <PasteIcon />
                  {typeInLabel}
                </MenuToggleAction>,
              ]}
              className="vnc-paste-button"
              isExpanded={isKeyboardSelectOpen}
              onClick={() => setIsKeyboardSelectOpen(!isKeyboardSelectOpen)}
              ref={toggleRef}
              variant="secondary"
            >
              {selectedKeyboard}
            </MenuToggle>
          )}
          isOpen={isKeyboardSelectOpen}
          isScrollable
          onOpenChange={(isOpen) => setIsKeyboardSelectOpen(isOpen)}
          selected={selectedKeyboard}
          shouldFocusToggleOnSelect
        >
          <DropdownGroup>
            <DropdownItem description={defaultKeyboard} value={defaultKeyboard}>
              {keyMaps[defaultKeyboard].description}
            </DropdownItem>
          </DropdownGroup>
          <Divider component="li" />
          <DropdownList>
            {Object.entries(keyMaps)
              .filter(([value]) => value !== defaultKeyboard)
              .sort(([, a], [, b]) => a.description.localeCompare(b.description))
              .map(([value, def]) => (
                <DropdownItem description={value} key={value} value={value}>
                  {def.description}
                </DropdownItem>
              ))}
          </DropdownList>
        </Dropdown>
      )}
      {type !== VNC_CONSOLE_TYPE && (
        <Button
          icon={
            <>
              <PasteIcon /> {t('Paste to console')}
            </>
          }
          onClick={
            actions.sendPaste
              ? (e: MouseEvent<HTMLButtonElement>) => {
                  e?.currentTarget?.blur();
                  actions
                    .sendPaste({ shouldFocusOnConsole: true })
                    // eslint-disable-next-line no-console
                    .catch((err) => console.error('Failed to paste into Serial console', err));
                }
              : undefined
          }
          className="vnc-paste-button"
          variant={ButtonVariant.link}
        />
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
      <Dropdown
        toggle={DropdownToggle({
          children: <>{t('Send key')}</>,
          className: 'access-consoles-selector',
          id: 'pf-v6-c-console__actions-vnc-toggle-id',
          isDisabled: type !== VNC_CONSOLE_TYPE,
          isExpanded: isOpenSendKey,
          onClick: () => setIsOpenSendKey((prevIsOpen) => !prevIsOpen),
        })}
        isOpen={isOpenSendKey}
        onOpenChange={setIsOpenSendKey}
        onSelect={() => setIsOpenSendKey(false)}
      >
        <DropdownList>
          {customButtons?.map(({ onClick, text }) => (
            <DropdownItem isDisabled={!onClick} key={text} onClick={onClick}>
              {text}
            </DropdownItem>
          ))}
        </DropdownList>
      </Dropdown>
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
