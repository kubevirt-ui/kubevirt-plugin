import React, { useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { getBooleanText } from '../../../../utils/utils';

type YesNoDropdownProps = {
  state: boolean;
  setState: React.Dispatch<React.SetStateAction<boolean>>;
};

const YesNoDropdown: React.FC<YesNoDropdownProps> = ({ state, setState }) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Select
      menuAppendTo="parent"
      onToggle={setIsOpen}
      isOpen={isOpen}
      variant={SelectVariant.single}
      selections={getBooleanText(state)}
      width={141}
      onSelect={() => setIsOpen(false)}
    >
      <SelectOption key="yes-opt" value={t('Yes')} onClick={() => setState(true)} />
      <SelectOption key="no-opt" value={t('No')} onClick={() => setState(false)} />
    </Select>
  );
};

export default YesNoDropdown;
