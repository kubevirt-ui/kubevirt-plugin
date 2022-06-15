import * as React from 'react';

import { Select, SelectOption, SelectOptionObject, SelectVariant } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/Consoles/AccessConsoles';

import {
  DESKTOP_VIEWER_CONSOLE_TYPE,
  NONE_TYPE,
  SERIAL_CONSOLE_TYPE,
  VNC_CONSOLE_TYPE,
} from '../utils/ConsoleConsts';

import { AccessConsolesProps, getChildTypeName, getConsoleForType } from './utils/accessConsoles';

import '@patternfly/react-styles/css/components/Consoles/AccessConsoles.css';
import './access-consoles.scss';

export const AccessConsoles: React.FC<AccessConsolesProps> = ({
  children,
  textSelectConsoleType = 'Select console type',
  textSerialConsole = 'Serial console',
  textVncConsole = 'VNC console',
  textDesktopViewerConsole = 'Desktop viewer',
  preselectedType = null,
}) => {
  const typeMap = {
    [SERIAL_CONSOLE_TYPE]: textSerialConsole,
    [VNC_CONSOLE_TYPE]: textVncConsole,
    [DESKTOP_VIEWER_CONSOLE_TYPE]: textDesktopViewerConsole,
  };

  const [type, setType] = React.useState(
    preselectedType !== NONE_TYPE
      ? ({ value: preselectedType, toString: () => typeMap[preselectedType] } as SelectOptionObject)
      : null,
  );

  const [isOpen, setIsOpen] = React.useState(false);

  const selectOptions = React.Children.toArray(children as React.ReactElement[]).map(
    (child: any) => {
      const typeText = getChildTypeName(child);
      const childType = typeMap[typeText] || typeText;
      return (
        <SelectOption
          key={childType}
          id={childType}
          value={{ value: childType, toString: () => childType } as SelectOptionObject}
        />
      );
    },
  ) as React.ReactElement[];

  return (
    <div className={css(styles.console)}>
      {React.Children.toArray(children).length > 1 && (
        <div className={css(styles.consoleActions, 'pf-u-w-0', 'access-consoles')}>
          <Select
            aria-label={textSelectConsoleType}
            placeholderText={textSelectConsoleType}
            toggleId="pf-c-console__type-selector"
            variant={SelectVariant.single}
            onSelect={(_, selection) => {
              setType(selection as SelectOptionObject);
              setIsOpen(false);
            }}
            selections={type}
            isOpen={isOpen}
            onToggle={(open: boolean) => {
              setIsOpen(open);
            }}
          >
            {selectOptions}
          </Select>
        </div>
      )}
      {type && getConsoleForType(type, children)}
    </div>
  );
};

AccessConsoles.displayName = 'AccessConsoles';
