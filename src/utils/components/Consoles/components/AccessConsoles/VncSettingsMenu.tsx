import React, { useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import {
  MenuToggle,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';
import { CogIcon } from '@patternfly/react-icons';

import { VncSettings } from './utils/accessConsoles';

const SHARED = 'SHARED';

const VncSettingsMenu: React.FunctionComponent<VncSettings> = ({ setShared, shared }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useKubevirtTranslation();
  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle icon={<CogIcon />} isExpanded={isOpen} onClick={onToggleClick} ref={toggleRef} />
  );

  return (
    <Select
      onSelect={(_, selection: string) => {
        if (selection === SHARED) {
          setShared(!shared);
        }
      }}
      id="checkbox-select"
      isOpen={isOpen}
      onOpenChange={(nextOpen: boolean) => setIsOpen(nextOpen)}
      role="menu"
      selected={[shared ? SHARED : ''].filter(Boolean)}
      toggle={toggle}
    >
      <SelectList>
        <SelectOption hasCheckbox isSelected={shared} value={SHARED}>
          {t('Connect in shared mode')}
        </SelectOption>
      </SelectList>
    </Select>
  );
};

export default VncSettingsMenu;
