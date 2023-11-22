import React, { useState } from 'react';

import { useKubevirtTranslation } from '@kubevirt-utils/hooks/useKubevirtTranslation';
import { Select, SelectOption, SelectVariant } from '@patternfly/react-core';

import { getBooleanText } from '../../../../utils/utils';

type YesNoDropdownProps = {
  setState: React.Dispatch<React.SetStateAction<boolean>>;
  state: boolean;
};

const YesNoDropdown: React.FC<YesNoDropdownProps> = ({ setState, state }) => {
  const { t } = useKubevirtTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Select
      isOpen={isOpen}
      menuAppendTo="parent"
      onSelect={() => setIsOpen(false)}
      onToggle={setIsOpen}
      selections={getBooleanText(state)}
      variant={SelectVariant.single}
      width={141}
    >
      <SelectOption key="yes-opt" onClick={() => setState(true)} value={t('Yes')} />
      <SelectOption key="no-opt" onClick={() => setState(false)} value={t('No')} />
    </Select>
  );
};

export default YesNoDropdown;
