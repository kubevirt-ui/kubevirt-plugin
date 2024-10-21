import React, { FC, useState } from 'react';

import SelectToggle from '@kubevirt-utils/components/toggles/SelectToggle';
import { t } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Select, SelectOption } from '@patternfly/react-core';
import { SelectList } from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';

import { AccessConsolesProps, typeMap } from './utils/accessConsoles';

import '@patternfly/react-styles/css/components/Consoles/AccessConsoles.css';
import './access-consoles.scss';

export const AccessConsoles: FC<AccessConsolesProps> = ({ isWindowsVM, setType, type }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <div className="kv-console">
      <div className="pf-v5-c-console">
        <div className={css('pf-v5-c-console__actions', 'pf-u-w-0', 'access-consoles')}>
          <Select
            onSelect={(_, selection: string) => {
              setType(selection);
              setIsOpen(false);
            }}
            toggle={SelectToggle({
              id: 'pf-c-console__type-selector',
              isExpanded: isOpen,
              onClick: () => setIsOpen((prevIsOpen) => !prevIsOpen),
              selected: type,
              style: { minWidth: '250px' },
            })}
            aria-label={t('Select console type')}
            isOpen={isOpen}
            onOpenChange={(open: boolean) => setIsOpen(open)}
            placeholder={t('Select console type')}
            selected={type}
          >
            <SelectList>
              {Object.values(typeMap(isWindowsVM)).map((name: string) => {
                return (
                  <SelectOption id={name} key={name} value={name}>
                    {name}
                  </SelectOption>
                );
              })}
            </SelectList>
          </Select>
        </div>
      </div>
    </div>
  );
};

AccessConsoles.displayName = 'AccessConsoles';
