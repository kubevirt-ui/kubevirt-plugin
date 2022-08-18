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

  const handleSelectOption = (value: boolean) => {
    setState(value);
    setIsOpen(false);
  };

  return (
    <Select
      menuAppendTo="parent"
      onToggle={setIsOpen}
      isOpen={isOpen}
      variant={SelectVariant.single}
      selections={getBooleanText(state)}
      width={141}
    >
      <SelectOption key="yes-opt" value={t('Yes')} onClick={() => handleSelectOption(true)} />
      <SelectOption key="no-opt" value={t('No')} onClick={() => handleSelectOption(false)} />
    </Select>
  );
};

export default YesNoDropdown;
