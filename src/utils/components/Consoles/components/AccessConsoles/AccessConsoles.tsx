import React, { Children, FC, useState } from 'react';

import SelectToggle from '@kubevirt-utils/components/toggles/SelectToggle';
import { Select, SelectOption } from '@patternfly/react-core';
import { SelectList } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';

import {
  DESKTOP_VIEWER_CONSOLE_TYPE,
  NONE_TYPE,
  SERIAL_CONSOLE_TYPE,
  VNC_CONSOLE_TYPE,
} from '../utils/ConsoleConsts';

import { AccessConsolesProps, getChildTypeName, getConsoleForType } from './utils/accessConsoles';

import '@patternfly/react-styles/css/components/Consoles/AccessConsoles.css';
import './access-consoles.scss';

export const AccessConsoles: FC<AccessConsolesProps> = ({
  children,
  preselectedType = null,
  textDesktopViewerConsole = 'Desktop viewer',
  textSelectConsoleType = 'Select console type',
  textSerialConsole = 'Serial console',
  textVncConsole = 'VNC console',
}) => {
  const typeMap = {
    [DESKTOP_VIEWER_CONSOLE_TYPE]: textDesktopViewerConsole,
    [SERIAL_CONSOLE_TYPE]: textSerialConsole,
    [VNC_CONSOLE_TYPE]: textVncConsole,
  };

  const [type, setType] = useState<null | string>(
    preselectedType !== NONE_TYPE ? preselectedType : null,
  );

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const selectOptions = Children.toArray(children).map((child: any) => {
    const typeText = getChildTypeName(child);
    const childType = typeMap[typeText] || typeText;
    return (
      <SelectOption id={childType} key={childType} value={childType}>
        {childType}
      </SelectOption>
    );
  });

  const onToggle = () => setIsOpen((prevIsOpen) => !prevIsOpen);
  return (
    <div className="kv-console">
      <div className="pf-v5-c-console">
        {Children.toArray(children).length > 1 && (
          <div className={css('pf-v5-c-console__actions', 'pf-u-w-0', 'access-consoles')}>
            <Select
              onSelect={(_, selection: string) => {
                setType(selection);
                setIsOpen(false);
              }}
              toggle={SelectToggle({
                id: 'pf-c-console__type-selector',
                isExpanded: isOpen,
                onClick: onToggle,
                selected: type,
                style: { minWidth: '250px' },
              })}
              aria-label={textSelectConsoleType}
              isOpen={isOpen}
              onOpenChange={(open: boolean) => setIsOpen(open)}
              placeholder={textSelectConsoleType}
              selected={type}
            >
              <SelectList>{selectOptions}</SelectList>
            </Select>
          </div>
        )}
        {type && getConsoleForType(type, children)}
      </div>
    </div>
  );
};

AccessConsoles.displayName = 'AccessConsoles';
