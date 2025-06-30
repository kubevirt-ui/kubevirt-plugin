/* eslint-disable @typescript-eslint/no-shadow */
import React, { FC, useState } from 'react';

import DropdownToggle from '@kubevirt-utils/components/toggles/DropdownToggle';
import SelectToggle from '@kubevirt-utils/components/toggles/SelectToggle';
import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  Button,
  ButtonVariant,
  Dropdown,
  DropdownItem,
  DropdownList,
  Select,
  SelectOption,
} from '@patternfly/react-core';
import { SelectList } from '@patternfly/react-core';
import {} from '@patternfly/react-core';
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

  return (
    <>
      <Button
        icon={
          <>
            <PasteIcon /> {t('Paste to console')}
          </>
        }
        className="vnc-paste-button"
        onClick={actions.sendPaste}
        variant={ButtonVariant.link}
      />
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
